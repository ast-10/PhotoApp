import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; // Import the custom hook

function AddPhoto() {
  const uploadInput = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Access the user context
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (isUploading) {
      console.log('Upload already in progress...');
      return;
    }
    setIsUploading(true);

    if (!uploadInput.current || uploadInput.current.files.length === 0) {
      alert('Please select a file to upload');
      setIsUploading(false);
      return;
    }

    try {
      const domForm = new FormData();
      domForm.append('uploadedphoto', uploadInput.current.files[0]);

      const response = await axios.post('/photos/new', domForm);

      alert('Photo uploaded successfully');

      if (user && user._id) {
        navigate(`/photos/${user._id}`, { state: { refresh: false } });
      } else {
        console.error('User information is missing.');
        alert('Failed to navigate to profile: User information unavailable');
      }
    } catch (error) {
      console.error('Error during upload:', error.response || error);
      alert('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>Add a New Photo</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" ref={uploadInput} />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>
    </div>
  );
}

export default AddPhoto;
