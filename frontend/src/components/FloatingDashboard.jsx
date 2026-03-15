import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts"

const data=[
{month:"Jan",value:400},
{month:"Feb",value:300},
{month:"Mar",value:600},
{month:"Apr",value:800},
{month:"May",value:700}
]

function FloatingDashboard(){

return(

<div className="floating-dashboard">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={data}>

<XAxis dataKey="month" stroke="#aaa"/>

<YAxis stroke="#aaa"/>

<Tooltip/>

<Line
type="monotone"
dataKey="value"
stroke="#4f8cff"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

)

}

export default FloatingDashboard