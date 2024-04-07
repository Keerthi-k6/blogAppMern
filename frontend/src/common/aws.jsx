import React from 'react';
import axios from 'axios';

export const uploadImage = async (img) => {
    let imgUrl = null;

    try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`);
        const { uploadURL } = response.data;

        await axios.put(uploadURL, img);

        // Assuming the PUT request succeeded, set the imgUrl
        imgUrl = uploadURL.split("?")[0];
    } catch (error) {
        // Handle errors here
        console.error('Error uploading image:', error);
    }

    return imgUrl;
};
