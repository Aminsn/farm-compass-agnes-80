
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Camera, Upload, X, UserRound } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  issue: z.string().min(5, { message: "Issue description must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  requestType: z.enum(["advice", "visit"], { 
    required_error: "Please select a request type" 
  }),
  preferredDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdvisorSupportRequest = () => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issue: "",
      description: "",
      requestType: "advice",
      preferredDate: "",
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

  const watchRequestType = form.watch("requestType");

  const onSubmit = (values: FormValues) => {
    // Simulate sending request to advisor
    console.log("Sending support request to advisor:", values, "With image:", imageFile);
    
    // Create response message based on request type
    const responseMessage = values.requestType === "advice" 
      ? `Thank you for your request about "${values.issue}". I'll review the information and provide advice within 24 hours.`
      : `Thank you for requesting a farm visit regarding "${values.issue}". I'll check my availability and confirm a visit date soon.`;
    
    // Add confirmation notification
    addNotification({
      title: "Support Request Sent",
      message: `Your ${values.requestType === "advice" ? "advice" : "visit"} request about "${values.issue}" has been sent to your advisor.`,
      type: "advisor",
      date: new Date(),
      actionRequired: false,
    });
    
    // Simulate advisor response (would normally come from backend)
    const responseTime = new Date();
    responseTime.setHours(responseTime.getHours() + 2); // Mock a response 2 hours later
    
    setTimeout(() => {
      addNotification({
        title: values.requestType === "advice" ? "Advice Response" : "Visit Confirmation",
        message: responseMessage,
        type: "advisor",
        date: responseTime,
        actionRequired: true,
        actionText: values.requestType === "advice" ? "View Advice" : "Confirm Visit",
      });
      
      console.log("Simulated advisor response added");
    }, 5000); // Simulate response after 5 seconds for demo
    
    // Show success message
    toast({
      title: "Request Sent",
      description: `Your ${values.requestType === "advice" ? "advice" : "visit"} request has been sent to your farm advisor`,
    });
    
    // Reset form
    form.reset();
    removeImage();
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">Request Advisor Support</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="requestType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Request Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advice" id="advice" />
                      <label htmlFor="advice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Request Advice
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visit" id="visit" />
                      <label htmlFor="visit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Request Farm Visit
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Summary</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Leaf discoloration in wheat field" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the issue in detail, including when you first noticed it and any actions you've already taken..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {watchRequestType === "visit" && (
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Visit Date (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input 
                        type="date"
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
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
            <UserRound className="h-4 w-4 mr-2" />
            {watchRequestType === "advice" ? "Submit Request for Advice" : "Request Farm Visit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdvisorSupportRequest;
