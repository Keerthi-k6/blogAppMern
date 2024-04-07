import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import InputBox from '../components/input.component'
import { useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { UserContext } from '../App'
const ChangePassword = () => {
    let {userAuth : {access_token}}= useContext(UserContext)
    let ChangePasswordForm = useRef()
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    const handleSubmit = (e) => {
        e.preventDefault()
        let form = new FormData(ChangePasswordForm.current)
        let formData = { }

        for (let [key, value] of form.entries()) {
            formData[key] = value
        }
        let { currentPassword, newPassword } = formData
        if(!currentPassword.length || !newPassword.length)
        {
            return toast.error("Please fill all the fields")
        }
        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword))
        {
            return toast.error("Password must be between 6 to 20 characters which contain at least one lowercase and uppercase letter and a number")
        }
        e.target.setAttribute("disabled",true)
        let loadingToast = toast.loading("Changing Password.....")
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password",formData,{
            headers:
            {
                'Authorization':`Bearer ${access_token}`
            }
        })
        .then(()=>
        {
            toast.dismiss(loadingToast)
            toast.success("Password Changed successfully")
            e.target.removeAttribute("disabled")
        })
        .catch(({response})=>
        {
            toast.dismiss(loadingToast)
            toast.error(response.data.error)
            e.target.removeAttribute("disabled")
        })

    }
  return (
    <AnimationWrapper>
    <Toaster/>
    <form ref={ChangePasswordForm}>


       <h1 className='max-md:hidden'>Change Password</h1>

       <div className="py-10 w-ful md:max-w-[400px]">
        <InputBox name="currentPassword" type="password" placeholder="Current Password" className="profile-edit-input" icon={"fi fi-rr-unlock"}/>
        <InputBox name="newPassword" type="password" placeholder="New Password" className="profile-edit-input" icon={"fi fi-rr-unlock"}/>

        <button className='btn-dark px-10' onClick={handleSubmit}>Change Password</button>
       </div>


    </form>
    </AnimationWrapper>
  )
}

export default ChangePassword
