import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../App'
import axios from 'axios'
import { profileDataStructure } from './profile.page'
import AnimationWrapper from '../common/page-animation'
import toast, { Toaster } from 'react-hot-toast'
import Loader from '../components/loader.component'
import InputBox from '../components/input.component'
import { uploadImage } from '../common/aws'
import { storeInSession } from '../common/session'
const EditProfile = () => {
    let {userAuth,userAuth : {access_token},setUserAuth} = useContext(UserContext)
    let bioLimit = 150
    let profileImgEle = useRef()
    let editProfileForm = useRef()
    const [profile,setProfile] = useState(profileDataStructure);
    const [loading,setLoading] = useState(true);
    const [charactersLeft,setCharactersLeft] = useState(bioLimit)
    const [updatedProfileImg,setUpdatedProfileImg] = useState(null)
    let {personal_info : {fullname,username:profile_username,profile_img,email,bio},social_links} = profile
    useEffect(()=>
    {
       if(access_token)
       {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile",{username : userAuth.username})
        .then(({data})=>
        {
            setProfile(data)
            setLoading(false)
        })
        .catch(err=>
            {
                console.log(err)
            })
       }
    },[access_token])
    const handleCharacterChange = (e)=>
    {
        setCharactersLeft(bioLimit - e.target.value.length)
        // setProfile({...profile,bio : e.target.value})
    }
    const handleImagePreview = (e)=>
    {
        let img = e.target.files[0]
        profileImgEle.current.src = URL.createObjectURL(img)
        setUpdatedProfileImg(img)
    }
    const handleImgUpload = (e)=>
    {
        e.preventDefault()
        if(updatedProfileImg)
        {
            let loadingToast = toast.loading("Uploading .....")
            e.target.setAttribute("disabled",true)
            uploadImage(updatedProfileImg)
            .then(url=>
                {
                    if(url)
                    {
                        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",{url},
                        {
                            headers:
                            {
                                'Authorization':`Bearer ${access_token}`
                            }
                        })
                        .then(({data})=>
                        {
                            let newUserAuth = {...userAuth,profile_img : data.profile_img}
                            storeInSession("user",JSON.stringify(newUserAuth))
                            setUserAuth(newUserAuth)
                            setUpdatedProfileImg(null)
                            toast.dismiss(loadingToast)
                            e.target.removeAttribute("disabled")
                            toast.success("Image uploaded successfully 👍")
                        })
                        .catch(({response})=>
                        {
                            toast.dismiss(loadingToast)
                            e.target.removeAttribute("disabled")
                            toast.error(response.data.message)
                        })

                    }
                })
        }
    }

    const handleSubmit = (e)=>
    {
        e.preventDefault()
        let form = new FormData(editProfileForm.current)
        let formData = { }
        for(let [key,value] of form.entries())
        {
            formData[key] = value
        }
        let {username,youtube,twitter,instagram,facebook,github,website,bio} = formData
        if(username.length<3)
        {
            return toast.error("Username must be atleast 3 characters long")
        }
        if(bio.length > bioLimit)
        {
            return toast.error("Bio must be less than 150 characters")
        }
       let loadingToast = toast.loading("Updating Profile ....")
       e.target.setAttribute("disabled",true)
       axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",{username,bio,social_links:{youtube,twitter,instagram,facebook,github,website}},{
        headers:
        {
            'Authorization':`Bearer ${access_token}`
        }
       })
       .then(({data})=>
       {
        if(userAuth.username !== data.username)
        {
            let newUserAuth = {...userAuth,username:data.username}
            storeInSession("user",JSON.stringify(newUserAuth))
            setUserAuth(newUserAuth)
        }
        toast.dismiss(loadingToast)
        e.target.removeAttribute("disabled")
        toast.success("Profile updated successfully 👍")
       })
       .catch(({response})=>
       {
        toast.dismiss(loadingToast)
        e.target.removeAttribute("disabled")
        toast.error(response.data.error)
       })

    }
  return (
    <AnimationWrapper>
       {
        loading ? <Loader/> : 
        <form ref={editProfileForm}>
            <Toaster/>

            <h1 className='max-md:hidden'>Edit Profile</h1>
            <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                <div className="max-lg:center mb-5">
                    <label htmlFor='uploadImg' id='profileImgLable' className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'>
                        <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                            Upload Image
                        </div>
                     <img src={profile_img} className='' ref={profileImgEle}/>   
                    </label>
                    <input type='file' id='uploadImg' accept='.jpg,.jpeg,.png' hidden onChange={handleImagePreview}/>

                    <button className='btn-light mt-5 max-lg:center lg:w-full px-10' onClick={handleImgUpload}>Upload</button>
                </div>

                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="">
                            <InputBox name="fullname" type = "text" value={fullname} disable={true} placeholder="Full Name" icon={"fi fi-rr-user"}/>
                        </div>
                        <div className="">
                            <InputBox name="email" type = "email" value={email} disable={true} placeholder="Full Name" icon={"fi fi-rr-envelope"}/>
                        </div>
                    </div>
                    <InputBox  type= "text" name="username" value={profile_username}  placeholder="Username" icon={"fi fi-rr-user" }/>
                    <p className='text-dark-grey -mt-3'>Username visible and searchable to other users</p>
                    <textarea className='input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5' name="bio" defaultValue={bio} maxLength={bioLimit} placeholder="Bio" onChange={handleCharacterChange}></textarea>
                    <p className='mt-1 text-dark-grey'> {charactersLeft} Characters Left</p>
                    <p className='text-dark-grey my-6'>Add your social handles below </p>
                    <div className="md:grid grid-cols-2 gap-x-6">
                        {
                            Object.keys(social_links).map((key,i)=>
                            {
                                let link = social_links[key]
                                return <InputBox type= "text" name={key} value={link}  placeholder="https://" icon={"fi " + (key!="website" ? "fi-brands-"+ key:"fi-rr-globe")} key ={i}/>
                            })
                        }
                    </div>
                    <button className='btn-dark w-auto px-10' type="submit" onClick={handleSubmit}>
                        Update 
                    </button>
                </div>
            </div>
        </form>
       } 
    </AnimationWrapper>
  )
}

export default EditProfile
