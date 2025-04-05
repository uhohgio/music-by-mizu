// src/App.tsx
import Layout from './components/Layout' // our layout
import './index.css'

function App() {
  // We will add our Layout component here soon
  return (
      <Layout>
      {/* This content will be passed as 'children' to Layout */}
      <h1 className="text-4xl font-bold text-center mb-6 align-middle text-gray-100"> {/* Example Tailwind */}
          <i>Music by Mizu</i>
      </h1>
      <div className = " text-gray-100 text-center">
        <ul className="text-2xl font-bold mb-2" > Tracks </ul> 
          <li> track 1</li>
          <li> track 2</li>
      </div>
      <p className='text-gray-100'> hypothetically Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
      {/* We'll add sections like Bio, Music Player, Contact here */}
      <hr className='text-white font-bold mt-8 '/>
    </Layout>
    
  )
}

export default App