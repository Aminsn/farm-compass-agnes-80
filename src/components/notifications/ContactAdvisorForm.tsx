
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Send } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

const formSchema = z.object({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactAdvisorForm = () => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values: FormValues) => {
    // Simulate sending message to advisor
    console.log("Sending message to advisor:", values, "With image:", imageFile);
    
    // Create a mock response from the advisor that would come later
    const responseTime = new Date();
    responseTime.setMinutes(responseTime.getMinutes() + 2); // Mock a response 2 minutes later
    
    // Add confirmation notification
    addNotification({
      id: Date.now().toString(),
      title: "Message Sent to Advisor",
      message: `Your message "${values.subject}" has been sent to your advisor. They will respond shortly.`,
      type: "advisor",
      date: new Date(),
      read: false,
      actionRequired: false,
    });
    
    // Simulate receiving a response from advisor (would normally come from backend)
    setTimeout(() => {
      addNotification({
        id: (Date.now() + 1).toString(),
        title: "Response from Advisor",
        message: `Thank you for your message about "${values.subject}". I've reviewed your crop image and will visit your farm next week to assess the situation in person.`,
        type: "advisor",
        date: responseTime,
        read: false,
        actionRequired: true,
        actionText: "Schedule Visit",
      });
      
      console.log("Simulated advisor response added");
    }, 10000); // Simulate response after 10 seconds for demo
    
    // Show success message
    toast({
      title: "Message Sent",
      description: "Your message has been sent to your farm advisor",
    });
    
    // Reset form
    form.reset();
    removeImage();
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">Contact Your Advisor</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Advice needed on crop issues" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the issue or questions you have for your advisor..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel htmlFor="image">Attach an Image (Optional)</FormLabel>
            
            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors bg-gray-50 hover:bg-gray-100">
                <Camera className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Upload a crop image for better diagnosis</p>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Max file size: 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-[200px] rounded-lg mx-auto object-contain bg-gray-100 border"
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-agrifirm-green hover:bg-agrifirm-green/90">
            <Send className="h-4 w-4 mr-2" />
            Send to Advisor
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactAdvisorForm;
