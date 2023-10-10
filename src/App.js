
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const App = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryEvents, setCategoryEvents] = useState([]);
  const [filteredEventCount, setFilteredEventCount] = useState();
  const [coordinatesArray, setCoordinatesArray] = useState([]);
  const[loading ,setLoading]=useState(true);
  const [showTable, setShowTable] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/categories');
        const data = await response.json();
        setCategories(data.categories);
        console.log(data.categories,"tüm kategoriler");
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const extractCoordinatesFromLink = async (link) => {

    try {
      const linkResponse = await fetch(link);
      const linkData = await linkResponse.json();
      const coordinates = linkData.geometries[0].coordinates;
      return coordinates;
    } catch (error) {
      console.error('Error extracting coordinates from link:', error);
      return null;
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/events');
        const data = await response.json();
        console.log("data",data)
        const filteredEvents = data.events.filter(event=>{
         return event.categories.some(cat=> cat.id==selectedCategory); })
        ;
        
        console.log("filteredEvents",filteredEvents)
        setCategoryEvents(filteredEvents)     
        setLoading(false);
        setFilteredEventCount(filteredEvents.length);
        console.log("categoryEvents",categoryEvents)
      
    const coordinatesArray = await Promise.all(
          categoryEvents.map(async (event) => {
            const coordinates = await extractCoordinatesFromLink(event.link);
             return coordinates;
          })
        );
        setCoordinatesArray(coordinatesArray);

        console.log("coordinatesArray",coordinatesArray)
        setShowTable(true);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setLoading(false);
      }
    };
    setCategoryEvents([]);
    fetchData();
  }, [selectedCategory]);



  const handleCategoryChange = categoryId => {

    setSelectedCategory(categoryId);
        console.log("tıklandı ve selectedCategory: ",selectedCategory)
  };


  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="flex flex-col space-y-2">
       <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <h1 className='text-blue-500'> Loading... </h1> 
        </div>
    </div>
    );
    }




  return (

   
    <div class="flex flex-col items-center justify-center min-h-screen">
<div > 
  <div class="absolute top-0 right-0">
  <img src="/nasa.png" alt="Resim Açıklaması" 
class=""
style={{ height: '100px', width: '200px' } }/>

</div>

<div class="absolute  border-2  font-bold mt-4 ml-2 top-0 left-0">
  <select onChange={e => handleCategoryChange(e.target.value)} value={selectedCategory}>
        <option value="">Select natural events</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>

</div>
</div>
 
<h1 class="text-4xl mt-8 text-red-700 font-bold mb-6">NASA-EONET</h1>
      {/* <p>Filtrelenen Kayıt Sayısı: {filteredEventCount}</p> */}

      <MapContainer  center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' } }  >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {categoryEvents.map(event => (
          <CircleMarker
            key={event.id}
            center={[event.geometries[0].coordinates[1], event.geometries[0].coordinates[0]]}
            radius={10}
            color="red"
            fillColor="red"
            fillOpacity={0.8}
          >
            <Popup>
             <strong>{event.categories[0].title}</strong>
                 <br />
              <strong>{event.title}</strong>
         

              <br />
              {new Date(event.geometries[0].date).toLocaleString()}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>  


 {showTable && (
 <div class="flex flex-col mt-2   items-center justify-center min-h-screen">  
 <h1 class="text-2xl  mb-2 text-center text-red-700  font-bold">Natural Event List </h1>

 <table class=" border-2 mt-2 w-11/12 md:w-3/4 lg:w-1/2 min-w-full table-auto">
    <thead>
      <tr>
        <th class="px-4 py-2 bg-blue-200">Title</th>
        <th class="px-4 py-2 bg-blue-200" >Type</th>
        <th class="px-4 py-2 bg-blue-200" >Date</th>
        <th class="px-4 py-2 bg-blue-200" > Location</th>
      </tr>
    </thead>
    <tbody>
      {categoryEvents.map(event => (
        <tr key={event.id}>
             <td class="border px-4 py-2">{event.title}</td>
             <td class="border px-4 py-2">{event.categories[0].title}</td>
             <td class="border px-4 py-2">{new Date(event.geometries[0].date).toLocaleString()}</td>
             <td class="border px-4 py-2">
        <a class="underline" href={event.link} target="_blank" rel="noopener noreferrer">
          {event.link}
        </a>
      </td>
        </tr>
      ))}
     </tbody>
          </table>
  
  
    </div>
     )}
</div>
  );
      };

export default App;
