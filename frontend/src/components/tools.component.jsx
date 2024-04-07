// importing tools ,editorjs tools are individual packages ,like code,link,image embedding etc 

import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Image from '@editorjs/image'
import Quote from '@editorjs/quote'
import Marker from '@editorjs/marker'
import  InlineCode  from '@editorjs/inline-code'
import {uploadImage} from '../common/aws'
const uploadImageByURL = (e)=>
{
    let link = new Promise((resolve,reject)=>
    {
        try
        {
            resolve(e)
        }
        catch(err)
        {
            reject(err)
        }
    })
    return link.then(url=>{
    return {
                success:1,
                file:{url}
            }
        })
}

const uploadImageByFile = (e)=>
{
    // editor.js takes the promise  so we use return two times 
   return uploadImage(e).then(url=>
    {if(url)
        {
            return {
                success:1,
                file:{url}
            }

        }
    })
}
export const tools = {
    embed: Embed,
    header:
    {
        class: Header,
        config:
        {
            placeholder:"Type Heading .....",
            levels: [2,3,4,5,6],
            defaultLevel: 2
        }
    },
    list: 
    {
        class: List,
        inlineToolbar: true
    },
    image:
    {
        class: Image,
        config: 
        {
            uploader: 
            {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile
            }
        }
    },
    quote: 
    {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode
}