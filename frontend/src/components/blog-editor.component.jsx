import React, { useContext, useEffect,} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import lightLogo from '../imgs/logo-light.png'
import darkLogo from '../imgs/logo-dark.png'
import AnimationWrapper from '../common/page-animation'
import lightBanner from '../imgs/blog banner light.png'
import darkBanner from '../imgs/blog banner dark.png'
import {uploadImage} from '../common/aws'
import { Toaster,toast}  from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import { tools } from './tools.component'
import EditorJS from '@editorjs/editorjs'
import axios from 'axios'
import { ThemeContext, UserContext } from '../App'
const BlogEditor = () => {
    let {blog,blog:{title,banner,content,tags,des},setBlog,textEditor,setTextEditor,setEditorState} = useContext(EditorContext)
    let navigate = useNavigate()
    const {userAuth :{access_token}} = useContext(UserContext)
    const {theme} = useContext(ThemeContext)
    let {blog_id} = useParams();
    useEffect(()=>{
        // EditorJS class from editorjs
        if(!textEditor.isReady)
        {
            setTextEditor( new EditorJS({
             holderId:"textEditor",
             data:Array.isArray(content)? content[0]:content,
             tools:tools,
             placeholder:"Let's start writing",
           }) )
            
        }
       
    },[])
    const handleBannerUpload = (e) => {

        let img =e.target.files[0];
        if(img)
        {
            let loadingToast = toast.loading("Uploading .....")
            uploadImage(img).then((url)=>
            {
                if(url)
                {
                    toast.dismiss(loadingToast)
                    toast.success("Uploaded 👍")
                
                      setBlog({...blog,banner:url})
                        
                }
            })
            .catch(err=>
                {
                  toast.dismiss(loadingToast)
                  return toast.error(err)  
                })
        }
    }
    const handleTitleKeyDown=(e)=>
    {
        if(e.keyCode == 13)
        {
            e.preventDefault();
        }
    }
    const handleTitleChange=(e)=>
    {
        let input = e.target;
        input.style.height= 'auto';
        input.style.height= input.scrollHeight + 'px';
        setBlog({...blog,title:input.value})

    }
    const handleError=(e)=>
    {
      let img = e.target
        img.src = theme == 'light' ? lightBanner : darkBanner
    }
    const handlePublishEvent = ()=>
    {
        if(!banner.length)
        {
            return toast.error("Please select banner")
        }
        if(!title.length)
        {
            return toast.error("Please enter title")
        }
        // texteditor is naturally fasle by editojs but when editor is ready is will automatically change it true, usually textEditor loads slowly  
        if(textEditor.isReady)
        {
            textEditor.save().then(data=>{
              if(data.blocks.length)
              {
                setBlog({...blog,content:data})
                setEditorState("publish")
                toast.success("Blog Published")
              }  
              else{
                return toast.error("Please write something to publish the blog")
              }
            })
            .catch((err)=>
            {
                console.log(err)
            })
        }
    }
    const handleSaveDraft = (e)=>
    {
        if(e.target.classList.contains('disable'))
        {
            return;
        }
            if(!title.length)
            {
                return toast.error("Write blog title before saving it as a draft")
            }
            let loadingToast = toast.loading("Saving draft .......")
    
            e.target.classList.add('disable')
             
            if(textEditor.isReady)
            {
                textEditor.save().then(content=>{
                    
                
                let blogObj = {
                  title,banner,des,content,tags,draft:true
                }
                
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",{...blogObj, id:blog_id},{
                  headers:
                  {
                    'Authorization':`Bearer ${access_token}`
                  }
                })
                .then(()=>
                {
                  e.target.classList.remove('disable')
                  toast.dismiss(loadingToast)
                  toast.success("Saved 👍")
                  setTimeout(()=>
                  {
                    navigate("/dashboard/blogs?tab=draft")  
                  },500);
                })
                .catch(({response})=>
                {
                    e.target.classList.remove('disable')
                    toast.dismiss(loadingToast)
                     return toast.error(response.data.error)
                  })
                })
            }
    }
  return (
    <>
    <nav className='navbar'>
        <Link to ='/' className='flex-none w-10'>
        <img src={theme === "light" ? darkLogo : lightLogo} />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full'>{title.length? title:"New Blog"}</p>

        <div className="flex gap-4 ml-auto">
            <button className='btn-dark py-2'
            onClick={handlePublishEvent}>
                Publish
            </button>
            <button className='btn-light py-2'
            onClick={handleSaveDraft}>
                Save Draft
            </button>
        </div>
    </nav>
    <Toaster/>
    <AnimationWrapper>
      <section>
        <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                <label htmlFor="uploadBanner">

                    <img 

                    src={banner}
                    className='z-20'
                    onError={handleError}
                    />
                    <input id='uploadBanner' 
                    type="file"
                    accept='.png, .jpg, .jpeg'
                    hidden
                    onChange={handleBannerUpload}
                    />
                </label>
            </div>
            <textarea 
            defaultValue={title}
            placeholder='Blog Title'
            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white'
            onKeyDown={
                handleTitleKeyDown 
            }
            onChange={handleTitleChange}>
           </textarea>
           <hr className='w-full opacity-10 my-5'/>
           <div className="font-gelasio" id="textEditor" ></div>
        </div>
        </section>  
    </AnimationWrapper>
    </>
  )
}

export default BlogEditor
