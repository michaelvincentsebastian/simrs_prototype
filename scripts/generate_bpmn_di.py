#!/usr/bin/env python3
"""
BPMN 2.0 Diagram Interchange Generator
Generates standard OMG BPMN 2.0 compliant XML with full Diagram Interchange (BPMNDI)
for all modular SIMRS Mini BPMN files.
"""

import sys
import xml.etree.ElementTree as ET
from collections import defaultdict, deque

NS = {
    'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    'bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
    'dc': 'http://www.omg.org/spec/DD/20100524/DC',
    'di': 'http://www.omg.org/spec/DD/20100524/DI',
    'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
}

for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)

def get_node_dimensions(tag):
    t = tag.split('}')[-1]
    if 'Event' in t:
        return 36, 36
    elif 'Gateway' in t:
        return 50, 50
    elif 'Task' in t or t == 'task' or t == 'subProcess':
        return 120, 80
    return 100, 60

def layout_bpmn(xml_content):
    # Parse XML
    root = ET.fromstring(xml_content)
    
    # Update root attributes for standard BPMN 2.0
    root.attrib['targetNamespace'] = 'http://bpmn.io/schema/bpmn'
    root.attrib['exporter'] = 'Camunda Modeler'
    root.attrib['exporterVersion'] = '5.20.0'

    # Find collaboration and participant
    collab = root.find('bpmn:collaboration', NS)
    participant = collab.find('bpmn:participant', NS) if collab is not None else None
    collab_id = collab.attrib['id'] if collab is not None else 'Collaboration_1'
    participant_id = participant.attrib['id'] if participant is not None else 'Participant_1'

    # Find process
    proc = root.find('bpmn:process', NS)
    proc_id = proc.attrib['id']

    # Find lanes
    laneSet = proc.find('bpmn:laneSet', NS)
    lanes = []
    node_to_lane = {}
    if laneSet is not None:
        for idx, l in enumerate(laneSet.findall('bpmn:lane', NS)):
            lid = l.attrib['id']
            lname = l.attrib.get('name', f'Lane {idx+1}')
            lanes.append((lid, lname))
            for fn in l.findall('bpmn:flowNodeRef', NS):
                node_to_lane[fn.text.strip()] = lid
    else:
        lanes.append(('Lane_Main', 'Main Process'))

    # Extract flow nodes
    nodes = {}
    node_elements = {}
    for elem in proc:
        tag = elem.tag.split('}')[-1]
        if tag not in ('documentation', 'laneSet', 'sequenceFlow'):
            nid = elem.attrib['id']
            w, h = get_node_dimensions(tag)
            nodes[nid] = {
                'id': nid,
                'tag': tag,
                'name': elem.attrib.get('name', ''),
                'w': w,
                'h': h,
                'lane': node_to_lane.get(nid, lanes[0][0])
            }
            node_elements[nid] = elem

    # Extract sequence flows
    flows = []
    adj = defaultdict(list)
    rev_adj = defaultdict(list)
    flow_dict = {}

    for sf in proc.findall('bpmn:sequenceFlow', NS):
        fid = sf.attrib['id']
        src = sf.attrib.get('sourceRef')
        tgt = sf.attrib.get('targetRef')
        name = sf.attrib.get('name', '')
        if src in nodes and tgt in nodes:
            flows.append((fid, src, tgt, name, sf))
            adj[src].append(tgt)
            rev_adj[tgt].append(src)
            flow_dict[fid] = (src, tgt, name)

    # Detect back-edges (cycles) using DFS
    visited = {}
    back_edges = set()

    def dfs(u):
        visited[u] = 1 # visiting
        for v in adj[u]:
            if visited.get(v) == 1:
                back_edges.add((u, v))
            elif visited.get(v) == 0:
                dfs(v)
        visited[u] = 2 # visited

    for n in nodes:
        visited[n] = 0
    
    # Start DFS from start events or in-degree 0
    start_nodes = [nid for nid, n in nodes.items() if 'Start' in n['tag'] or 'start' in n['tag'].lower() or len(rev_adj[nid]) == 0]
    if not start_nodes:
        start_nodes = [list(nodes.keys())[0]]

    for sn in start_nodes:
        if visited[sn] == 0:
            dfs(sn)

    # Topological rank calculation ignoring back-edges
    dag_adj = defaultdict(list)
    dag_in_deg = defaultdict(int)
    for u in nodes:
        for v in adj[u]:
            if (u, v) not in back_edges:
                dag_adj[u].append(v)
                dag_in_deg[v] += 1

    rank = {n: 0 for n in nodes}
    queue = deque([n for n in nodes if dag_in_deg[n] == 0])

    while queue:
        u = queue.popleft()
        for v in dag_adj[u]:
            if rank[v] < rank[u] + 1:
                rank[v] = rank[u] + 1
            dag_in_deg[v] -= 1
            if dag_in_deg[v] == 0:
                queue.append(v)

    # Determine lane heights and Y positions
    lane_nodes = defaultdict(list)
    for nid, n in nodes.items():
        lane_nodes[n['lane']].append(nid)

    lane_info = {}
    current_lane_y = 60
    for lid, lname in lanes:
        lns = lane_nodes[lid]
        ranks_in_lane = [rank[nid] for nid in lns]
        has_duplicate_rank = len(ranks_in_lane) != len(set(ranks_in_lane))
        
        if has_duplicate_rank or len(lns) > 8:
            height = 240
            tracks = [current_lane_y + 60, current_lane_y + 170]
        else:
            height = 160
            tracks = [current_lane_y + 80]
            
        lane_info[lid] = {
            'y': current_lane_y,
            'height': height,
            'tracks': tracks,
            'next_track_idx': 0
        }
        current_lane_y += height

    total_diagram_height = current_lane_y - 60

    # Layout X and Y coordinates
    sorted_nodes = sorted(nodes.keys(), key=lambda n: (rank[n], n))
    
    col_width = 180
    start_x = 260
    
    node_coords = {}
    lane_last_x = defaultdict(lambda: start_x - col_width)
    
    for nid in sorted_nodes:
        n = nodes[nid]
        lid = n['lane']
        linf = lane_info[lid]
        
        base_x = start_x + rank[nid] * col_width
        min_x = max(base_x, lane_last_x[lid] + col_width)
        
        tracks = linf['tracks']
        if len(tracks) > 1:
            incomings = rev_adj[nid]
            if any('Gateway' in nodes.get(inc, {}).get('tag', '') and adj[inc].index(nid) > 0 for inc in incomings if nid in adj[inc]):
                t_idx = 1
            else:
                t_idx = 0
        else:
            t_idx = 0
            
        center_y = tracks[t_idx]
        
        w, h = n['w'], n['h']
        x = min_x
        y = center_y - (h / 2)
        
        node_coords[nid] = [x, y, w, h, center_y]
        lane_last_x[lid] = x

    # Re-adjust X for dependencies so that target.x > source.x + source.w for non-back-edges
    for _ in range(4):
        for fid, src, tgt, name, sf in flows:
            if (src, tgt) not in back_edges:
                sx, sy, sw, sh, scy = node_coords[src]
                tx, ty, tw, th, tcy = node_coords[tgt]
                if tx < sx + sw + 50:
                    diff = (sx + sw + 60) - tx
                    node_coords[tgt][0] = tx + diff
                    lane_last_x[nodes[tgt]['lane']] = max(lane_last_x[nodes[tgt]['lane']], tx + diff)

    # Compute diagram width
    max_x = max(coord[0] + coord[2] for coord in node_coords.values())
    diagram_width = max_x + 160

    # Build BPMNDiagram XML
    for d in root.findall('bpmndi:BPMNDiagram', NS):
        root.remove(d)

    bpmn_diagram = ET.SubElement(root, f"{{{NS['bpmndi']}}}BPMNDiagram", {'id': f'BPMNDiagram_{proc_id}'})
    bpmn_plane = ET.SubElement(bpmn_diagram, f"{{{NS['bpmndi']}}}BPMNPlane", {
        'id': f'BPMNPlane_{proc_id}',
        'bpmnElement': collab_id if collab is not None else proc_id
    })

    # Participant Shape
    if collab is not None:
        part_shape = ET.SubElement(bpmn_plane, f"{{{NS['bpmndi']}}}BPMNShape", {
            'id': f'{participant_id}_di',
            'bpmnElement': participant_id,
            'isHorizontal': 'true'
        })
        ET.SubElement(part_shape, f"{{{NS['dc']}}}Bounds", {
            'x': '160',
            'y': '60',
            'width': str(int(diagram_width - 160 + 80)),
            'height': str(int(total_diagram_height))
        })

    # Lane Shapes
    for lid, lname in lanes:
        linf = lane_info[lid]
        lane_shape = ET.SubElement(bpmn_plane, f"{{{NS['bpmndi']}}}BPMNShape", {
            'id': f'{lid}_di',
            'bpmnElement': lid,
            'isHorizontal': 'true'
        })
        ET.SubElement(lane_shape, f"{{{NS['dc']}}}Bounds", {
            'x': '190',
            'y': str(int(linf['y'])),
            'width': str(int(diagram_width - 190 + 50)),
            'height': str(int(linf['height']))
        })

    # Node Shapes
    for nid in sorted_nodes:
        n = nodes[nid]
        x, y, w, h, cy = node_coords[nid]
        attribs = {
            'id': f'{nid}_di',
            'bpmnElement': nid
        }
        if 'Gateway' in n['tag']:
            attribs['isMarkerVisible'] = 'true'

        node_shape = ET.SubElement(bpmn_plane, f"{{{NS['bpmndi']}}}BPMNShape", attribs)
        ET.SubElement(node_shape, f"{{{NS['dc']}}}Bounds", {
            'x': str(int(x)),
            'y': str(int(y)),
            'width': str(int(w)),
            'height': str(int(h))
        })
        
        # Add Label for events & gateways if name present
        if n['name'] and ('Gateway' in n['tag'] or 'Event' in n['tag']):
            label = ET.SubElement(node_shape, f"{{{NS['bpmndi']}}}BPMNLabel")
            if 'Gateway' in n['tag']:
                ET.SubElement(label, f"{{{NS['dc']}}}Bounds", {
                    'x': str(int(x - 20)),
                    'y': str(int(y - 30)),
                    'width': '90',
                    'height': '24'
                })
            else:
                ET.SubElement(label, f"{{{NS['dc']}}}Bounds", {
                    'x': str(int(x - 25)),
                    'y': str(int(y + h + 5)),
                    'width': '86',
                    'height': '24'
                })

    # Edge Waypoints
    for fid, src, tgt, name, sf in flows:
        sx, sy, sw, sh, scy = node_coords[src]
        tx, ty, tw, th, tcy = node_coords[tgt]
        
        edge = ET.SubElement(bpmn_plane, f"{{{NS['bpmndi']}}}BPMNEdge", {
            'id': f'{fid}_di',
            'bpmnElement': fid
        })

        is_back = (src, tgt) in back_edges or tx <= sx

        if not is_back:
            if abs(scy - tcy) < 10:
                waypoints = [
                    (sx + sw, scy),
                    (tx, tcy)
                ]
            else:
                mid_x = sx + sw + (tx - (sx + sw)) / 2
                waypoints = [
                    (sx + sw, scy),
                    (mid_x, scy),
                    (mid_x, tcy),
                    (tx, tcy)
                ]
        else:
            loop_y = max(sy + sh, ty + th) + 45
            waypoints = [
                (sx + sw / 2, sy + sh),
                (sx + sw / 2, loop_y),
                (tx + tw / 2, loop_y),
                (tx + tw / 2, ty + th)
            ]

        for wx, wy in waypoints:
            ET.SubElement(edge, f"{{{NS['di']}}}waypoint", {
                'x': str(int(wx)),
                'y': str(int(wy))
            })

        if name:
            label = ET.SubElement(edge, f"{{{NS['bpmndi']}}}BPMNLabel")
            lx = (waypoints[0][0] + waypoints[1][0]) / 2 - 15
            ly = waypoints[0][1] - 18
            ET.SubElement(label, f"{{{NS['dc']}}}Bounds", {
                'x': str(int(lx)),
                'y': str(int(ly)),
                'width': '40',
                'height': '14'
            })

    rough_string = ET.tostring(root, 'utf-8')
    import xml.dom.minidom
    reparsed = xml.dom.minidom.parseString(rough_string)
    pretty = reparsed.toprettyxml(indent="  ", encoding="UTF-8").decode('utf-8')
    
    clean_lines = [l for l in pretty.splitlines() if l.strip()]
    return '\n'.join(clean_lines) + '\n'

if __name__ == '__main__':
    target_file = sys.argv[1] if len(sys.argv) > 1 else 'bpmn/rawat_jalan/antrian/02-antrian-dokter.bpmn'
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    result = layout_bpmn(content)
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(result)
    print(f"Successfully generated BPMN 2.0 with full Diagram Interchange for {target_file}")
