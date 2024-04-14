import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormMessage,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import plus from "../assets/plus-small.svg"
import cross from "../assets/cross-small.svg"
import { postSchema } from "@/utils/zodFormSchema";
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Loader from "@/myComponents/Loader";
import { createNewPost } from "@/utils/api.js";
import { useUserContext } from "@/context/authContext";

function CreatePostForm() {
  const [files, setFiles] = useState([]);
  const [isFileError, setIsFileError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [totalSize, setTotalSize] = useState(0);
  const {user} = useUserContext()
  const form = useForm({
    resolver: zodResolver(postSchema)
  });
  const formData = new FormData();


  async function handleImageUpload(data) {
    try {
      const fileUrl = [];
      const fileId = [];
      setIsFileError(!isFileError);
      setIsLoading(true);
      if (files.length === 0) {
        setIsFileError(true);
        return;
      }
  
      // Create a FormData object and append each file
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });
  
      // Upload files to the server
      const response = await axios.post("https://desk-labs-backene.onrender.com/api/v1/uploader/upload", formData);
  
      // Process response to get image URLs and IDs
      response.data.imageUrl.forEach(data => {
        fileUrl.push(data.url);
        fileId.push(data.id);
      });
  
  
      // Call createNewPost with the extracted data
      const post = await createNewPost({
        caption: data.caption,
        desc: data.desc,
        tags: data.tags,
        imageId: fileId, 
        imageUrl: fileUrl,
        userId:user.id
      });
  
    } catch (error) {
      throw new Error(error.message)      // Handle the error here
    } finally {
      form.reset()
      setIsLoading(false);
      setFiles([]);
    }
  }
  

  const onDrop = useCallback(acceptedFiles => {
    let newFiles = [];
    let newSize = 0;
    acceptedFiles.forEach(file => {
      if (totalSize + file.size <= 50 * 1024 * 1024) { // Convert MB to bytes
        newFiles.push(file);
        newSize += file.size;
      }
    });
    setFiles([...files, ...newFiles]);
    setTotalSize(totalSize + newSize);
  }, [files, totalSize]);

  const deleteFile = (index) => {
    const newFiles = [...files];
    const deletedFile = newFiles.splice(index, 1)[0];
    setFiles(newFiles);
    setTotalSize(totalSize - deletedFile.size);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop , accept:{
    'image/*':['.png','.jpg','.jpeg','.svg'],
  }});

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className="w-full h-full flex px-6 justify-center items-center flex-col">
        <div className="md:w-[70%] md:h-[70%] w-full h-full md:mt-0 mt-20 flex gap-5 flex-col">
          <p className="text-pri-400 font-semibold text-3xl text-left">Create New Post</p>

          <Card className="w-full h-fit">
            <CardContent className="w-full h-full pt-6">
              <Form {...form} className="space-y-8">
                <form onSubmit={form.handleSubmit(handleImageUpload)} className="space-y-8">

                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter caption" {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>This is the caption for your post.</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="desc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your post description" />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Description for your post</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tags" {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Separate tags with commas.</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add Images</FormLabel>
                        <FormControl>
                          <div className={`md:flex ${files.length === 0 ? "" : "gap-4"}`}>
                            <div className={`flex-wrap flex gap-4 md:mb-0 mb-4 relative`}>
                              {files.map((file, index) => (
                                <div className="w-20 h-20 rounded-sm relative" key={index}>
                                  <button onClick={() => deleteFile(index)} className="flex justify-center items-center absolute bottom-0 right-0 m-2 w-4 h-4 bg-white rounded-sm">
                                    <img src={cross} alt="" className="w-3 h-3" />
                                  </button>
                                  <img src={URL.createObjectURL(file)} className="md:w-20 w-full h-20 rounded-sm" alt={file.name} />
                                </div>
                              ))}
                            </div>
                            <div {...getRootProps()} className="w-20 h-20 flex justify-center items-center rounded-sm bg-slate-200 border-[2px] border-gray-400">
                              <img src={plus} className="w-4 h-4" />
                              <input {...getInputProps()}  accept="image/*" {...field} />
                            </div>

                          </div>
                        </FormControl>
                        <FormMessage />
                        {
                          isFileError ? <div>
                            <Alert variant="destructive">
                              <ExclamationTriangleIcon className="h-4 w-4" />
                              <AlertDescription>
                                You must Upload Atleast One Image !
                              </AlertDescription>
                            </Alert>

                          </div> : ""
                        }
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="" className="p-4 px-4 w-fit">
                    {
                      isLoading ?
                        <Loader /> : <p>Create Post</p>
                    }</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreatePostForm;


