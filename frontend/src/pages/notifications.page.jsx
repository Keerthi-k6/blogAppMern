import React, { useContext, useState,useEffect } from 'react'
import axios from 'axios'
import { UserContext } from '../App'
import { filterPaginationData } from '../common/filter-pagination-data'
import Loader from '../components/loader.component'
import AnimationWrapper from '../common/page-animation'
import NoDataMessage from '../components/nodata.component'
import NotificationCard from '../components/notification-card.component'
import LoadMoreDataBtn from '../components/load-more.component'
const Notifications = () => {
    let  {userAuth,userAuth :{access_token,new_notification_available},setUserAuth} = useContext(UserContext)
    const [filter,setFilter] = useState('all')
    let [notifications,setNotifications] = useState(null)
    let filters = ['all','like','comment','reply']

    const fetchNotifications = ({page,deletedDocCount=0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications",{page,deletedDocCount,filter},{
            headers:
            {
                'Authorization':`Bearer ${access_token}`
            }
        })
        .then(async({data:{notifications : data}})=>{
            console.log(data)
            if(new_notification_available)
            {
                setUserAuth({...userAuth,new_notification_available:false})
            }
            let formatedData  = await filterPaginationData({
               state:notifications,
               data,page,
               countRoute:"/all-notifications-count",
               data_to_send:{filter},
               user:access_token

            }) 
            setNotifications(formatedData)
            console.log(formatedData)
        })
        .catch(err=>console.log(err))
    }
    const handleFilter = (e) =>{
        let btn = e.target
        setFilter(btn.innerHTML)
        setNotifications(null)

    }
    useEffect(()=>
    {
         if(access_token)
         {
            fetchNotifications({page:1})
         }
    },[access_token,filter])
  return (
    <div>
     <h1 className='max-md:hidden'>Recent Notifications</h1>
     <div className="my-8 flex gap-6">
        {
            filters.map((filterName,i)=>
            {
                return <button key={i} onClick={handleFilter}className={"py-2 "+(filterName == filter ? 'btn-dark':'btn-light')} >{filterName}</button>
            })
        }
     </div>
     {
        notifications == null ? <Loader/>:
        <>
        {
            notifications.results.length ? 
            notifications.results.map((notification,i)=>
            {
                return <AnimationWrapper key ={i} transition={{delay : i*0.08}}> <NotificationCard data = {notification} index={i} notificationState={{notifications,setNotifications}}/></AnimationWrapper>
            })
            : <NoDataMessage message = "no notifications" />
        }
        <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} addtionalParam= {{deletedDocCount:notifications.deletedDocCount}}/>
        </>
     }
    </div>
  )
}

export default Notifications
