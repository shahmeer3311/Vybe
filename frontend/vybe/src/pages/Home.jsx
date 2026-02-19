import React from 'react'
import LeftHome from '../components/LeftHome'
import RightHome from '../components/RightHome'
import Feed from '../components/Feed'

const Home = ({user}) => {
  if(!user) return <div className='text-white'>Loading...</div>
  return (
    <div className='flex items-center'>
     <LeftHome user={user} />
     <Feed user={user} />
     <RightHome user={user} />
    </div>
  )
}

export default Home
