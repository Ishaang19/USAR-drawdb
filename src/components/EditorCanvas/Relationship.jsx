import { useMemo, useRef, useState, useEffect } from "react"; 

import { Cardinality, ObjectType, Tab } from "../../data/constants"; 

import { calcPath } from "../../utils/calcPath"; 

import { useDiagram, useSettings, useLayout, useSelect } from "../../hooks"; 

import { useTranslation } from "react-i18next"; 

import { SideSheet } from "@douyinfe/semi-ui"; 

import RelationshipInfo from "../EditorSidePanel/RelationshipsTab/RelationshipInfo"; 

 

const labelFontSize = 16; 

 

export default function Relationship({ data, relationshipIndex = 0, totalRelated = 1 }) { 

const { settings } = useSettings(); 

const { tables } = useDiagram(); 

const { layout } = useLayout(); 

const { selectedElement, setSelectedElement } = useSelect(); 

const { t } = useTranslation(); 

const [isHovered, setIsHovered] = useState(false); 

 

const pathValues = useMemo(() => { 

const startTable = tables.find((t) => t.id === data.startTableId); 

const endTable = tables.find((t) => t.id === data.endTableId); 

 

if (!startTable || !endTable) return null; 

 

return { 

startFieldIndex: startTable.fields.findIndex( 

(f) => f.id === data.startFieldId, 

), 

endFieldIndex: endTable.fields.findIndex((f) => f.id === data.endFieldId), 

startTable: { x: startTable.x, y: startTable.y }, 

endTable: { x: endTable.x, y: endTable.y }, 

}; 

}, [tables, data]); 

 

const pathRef = useRef(); 

const labelRef = useRef(); 

 

let cardinalityStart = "1"; 

let cardinalityEnd = "1"; 

 

switch (data.cardinality) { 

// the translated values are to ensure backwards compatibility 

case t(Cardinality.MANY_TO_ONE): 

case Cardinality.MANY_TO_ONE: 

cardinalityStart = data.manyLabel || "n"; 

cardinalityEnd = "1"; 

break; 

case t(Cardinality.ONE_TO_MANY): 

case Cardinality.ONE_TO_MANY: 

cardinalityStart = "1"; 

cardinalityEnd = data.manyLabel || "n"; 

break; 

case t(Cardinality.ONE_TO_ONE): 

case Cardinality.ONE_TO_ONE: 

cardinalityStart = "1"; 

cardinalityEnd = "1"; 

break; 

default: 

break; 

} 

 

let cardinalityStartX = 0; 

let cardinalityEndX = 0; 

let cardinalityStartY = 0; 

let cardinalityEndY = 0; 

let labelX = 0; 

let labelY = 0; 

 

let labelWidth = labelRef.current?.getBBox().width ?? 0; 

let labelHeight = labelRef.current?.getBBox().height ?? 0; 

 

const cardinalityOffset = 28; 

// Calculate perpendicular offset for multiple relationships on same field 

const lateralOffset = totalRelated > 1 ? (relationshipIndex - (totalRelated - 1) / 2) * 20 : 0; 

 

if (pathRef.current) { 

const pathLength = pathRef.current.getTotalLength(); 

 

const labelPoint = pathRef.current.getPointAtLength(pathLength / 2); 

labelX = labelPoint.x - (labelWidth ?? 0) / 2; 

labelY = labelPoint.y + (labelHeight ?? 0) / 2; 

 

const point1 = pathRef.current.getPointAtLength(cardinalityOffset); 

const point2 = pathRef.current.getPointAtLength( 

pathLength - cardinalityOffset, 

); 

 

// Calculate perpendicular offset for start cardinality 

const startTangent = pathRef.current.getPointAtLength(cardinalityOffset + 1); 

const startAngle = Math.atan2(startTangent.y - point1.y, startTangent.x - point1.x); 

const startPerpAngle = startAngle + Math.PI / 2; 

 

cardinalityStartX = point1.x + Math.cos(startPerpAngle) * lateralOffset; 

cardinalityStartY = point1.y + Math.sin(startPerpAngle) * lateralOffset; 

 

// Calculate perpendicular offset for end cardinality 

const endTangent = pathRef.current.getPointAtLength(pathLength - cardinalityOffset - 1); 

const endAngle = Math.atan2(point2.y - endTangent.y, point2.x - endTangent.x); 

const endPerpAngle = endAngle + Math.PI / 2; 

 

cardinalityEndX = point2.x + Math.cos(endPerpAngle) * lateralOffset; 

cardinalityEndY = point2.y + Math.sin(endPerpAngle) * lateralOffset; 

} 

 

const edit = () => { 

if (!layout.sidebar) { 

setSelectedElement((prev) => ({ 

...prev, 

element: ObjectType.RELATIONSHIP, 

id: data.id, 

open: true, 

})); 

} else { 

setSelectedElement((prev) => ({ 

...prev, 

currentTab: Tab.RELATIONSHIPS, 

element: ObjectType.RELATIONSHIP, 

id: data.id, 

open: true, 

})); 

if (selectedElement.currentTab !== Tab.RELATIONSHIPS) return; 

document 

.getElementById(`scroll_ref_${data.id}`) 

.scrollIntoView({ behavior: "smooth" }); 

} 

}; 

 

return ( 

<> 

<g 

className="select-none group" 

onDoubleClick={edit} 

onMouseEnter={() => setIsHovered(true)} 

onMouseLeave={() => setIsHovered(false)} 

> 

{/* invisible wider path for better hover ux */} 

<path 

d={calcPath(pathValues, settings.tableWidth)} 

fill="none" 

stroke="transparent" 

strokeWidth={12} 

cursor="pointer" 

/> 

<path 

ref={pathRef} 

d={calcPath(pathValues, settings.tableWidth)} 

className="relationship-path" 

fill="none" 

cursor="pointer" 

style={{ 

strokeWidth: isHovered ? 3 : 2, 

stroke: isHovered ? "#0ea5e9" : undefined, 

transition: "stroke-width 0.2s, stroke 0.2s" 

}} 

/> 

{settings.showRelationshipLabels && ( 

<text 

x={labelX} 

y={labelY} 

fill={settings.mode === "dark" ? "lightgrey" : "#333"} 

fontSize={labelFontSize} 

fontWeight={500} 

ref={labelRef} 

className="group-hover:fill-sky-600" 

> 

{data.name} 

</text> 

)} 

{pathRef.current && settings.showCardinality && ( 

<> 

<CardinalityLabel 

x={cardinalityStartX} 

y={cardinalityStartY} 

text={cardinalityStart} 

isHovered={isHovered} 

/> 

<CardinalityLabel 

x={cardinalityEndX} 

y={cardinalityEndY} 

text={cardinalityEnd} 

isHovered={isHovered} 

/> 

</> 

)} 

{/* Tooltip on hover */} 

{isHovered && ( 

<g> 

<rect 

x={labelX - 10} 

y={labelY - labelHeight - 35} 

rx={4} 

ry={4} 

width={Math.max(labelWidth + 20, 150)} 

height={45} 

fill={settings.mode === "dark" ? "#1f2937" : "white"} 

stroke={settings.mode === "dark" ? "#374151" : "#d1d5db"} 

strokeWidth={1} 

style={{ 

filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" 

}} 

/> 

<text 

x={labelX} 

y={labelY - labelHeight - 18} 

fill={settings.mode === "dark" ? "#e5e7eb" : "#111827"} 

fontSize={12} 

fontWeight={600} 

> 

{data.name} 

</text> 

<text 

x={labelX} 

y={labelY - labelHeight - 5} 

fill={settings.mode === "dark" ? "#9ca3af" : "#6b7280"} 

fontSize={10} 

> 

{data.cardinality} 

</text> 

</g> 

)} 

</g> 

<SideSheet 

title={t("edit")} 

size="small" 

visible={ 

selectedElement.element === ObjectType.RELATIONSHIP && 

selectedElement.id === data.id && 

selectedElement.open && 

!layout.sidebar 

} 

onCancel={() => { 

setSelectedElement((prev) => ({ 

...prev, 

open: false, 

})); 

}} 

style={{ paddingBottom: "16px" }} 

> 

<div className="sidesheet-theme"> 

<RelationshipInfo data={data} /> 

</div> 

</SideSheet> 

</> 

); 

} 

 

function CardinalityLabel({ x, y, text, r = 12, padding = 14, isHovered = false }) { 

const [textWidth, setTextWidth] = useState(0); 

const textRef = useRef(null); 

 

useEffect(() => { 

if (textRef.current) { 

const bbox = textRef.current.getBBox(); 

setTextWidth(bbox.width); 

} 

}, [text]); 

 

return ( 

<g> 

<rect 

x={x - textWidth / 2 - padding / 2} 

y={y - r} 

rx={r} 

ry={r} 

width={textWidth + padding} 

height={r * 2} 

fill={isHovered ? "#0ea5e9" : "grey"} 

className="group-hover:fill-sky-600" 

style={{ 

transition: "fill 0.2s" 

}} 

/> 

<text 

ref={textRef} 

x={x} 

y={y} 

fill="white" 

strokeWidth="0.5" 

textAnchor="middle" 

alignmentBaseline="middle" 

> 

{text} 

</text> 

</g> 

); 

} 

 