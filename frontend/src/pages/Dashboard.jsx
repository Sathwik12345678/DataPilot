import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"

function Dashboard(){

return(

<>
<Starfield/>
<Navbar/>

<div className="dashboard-container">

<h1>Dashboard</h1>

<p className="dashboard-subtitle">
Upload a dataset to generate insights
</p>

<div className="upload-card">

<input type="file"/>

<button className="btn-primary">
Analyze Dataset
</button>

</div>

</div>

</>

)

}

export default Dashboard