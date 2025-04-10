
import React, { useState, useEffect } from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Event } from '@/types';
import { useEvents } from '@/context/EventContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, RefreshCw } from "lucide-react";

interface CalendarProps {
  events?: Event[];
}

const PlanningCalendar: React.FC<CalendarProps> = ({ events = [] }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({});
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { updateEvent } = useEvents();

  useEffect(() => {
    const groupedEvents: { [key: string]: Event[] } = events.reduce((acc: { [key: string]: Event[] }, event) => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push(event);
      return acc;
    }, {});
    setEventsByDate(groupedEvents);
    setFilteredEvents(events);
  }, [events]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = format(date, 'yyyy-MM-dd');
      const numEvents = eventsByDate[dateString]?.length || 0;
      if (numEvents > 0) {
        return (
          <div className="flex justify-center items-center h-6 w-6 bg-agrifirm-green rounded-full text-white text-xs font-semibold">
            {numEvents}
          </div>
        );
      }
    }
    return null;
  };

  const handleDateChange = (date: Date) => {
    setDate(date);
    setSelectedDate(date);
    setSelectedEventType(null);
    setSelectedStatus(null);
    setIsFilterActive(false);
    setFilteredEvents(eventsByDate[format(date, 'yyyy-MM-dd')] || []);
  };

  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType);
    setSelectedDate(null);
    setSelectedStatus(null);
    setIsFilterActive(false);
    setFilteredEvents(events.filter(event => event.type === eventType));
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setSelectedDate(null);
    setSelectedEventType(null);
    setIsFilterActive(false);
    setFilteredEvents(events.filter(event => event.status === status));
  };

  const applyFilters = () => {
    if (selectedDate) {
      setFilteredEvents(eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || []);
      setIsFilterActive(true);
    } else if (selectedEventType) {
      setFilteredEvents(events.filter(event => event.type === selectedEventType));
      setIsFilterActive(true);
    } else if (selectedStatus) {
      setFilteredEvents(events.filter(event => event.status === selectedStatus));
      setIsFilterActive(true);
    }
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedEventType(null);
    setSelectedStatus(null);
    setIsFilterActive(false);
    setFilteredEvents(events);
  };

  const handleEventStatusChange = (eventId: string, newStatus: string) => {
    updateEvent(eventId, { status: newStatus });
  };

  // Helper function to get appropriate badge color based on event type
  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'planting':
        return 'bg-agrifirm-light-green text-agrifirm-black';
      case 'harvesting':
        return 'bg-agrifirm-yellow text-agrifirm-black';
      case 'inspection':
        return 'bg-agrifirm-light-yellow text-agrifirm-black';
      case 'maintenance':
        return 'bg-agrifirm-grey/80 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Helper function to get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 overflow-hidden">
          <div className="bg-agrifirm-light-yellow-2/30 px-4 py-3 border-b border-agrifirm-light-green/10">
            <h3 className="font-medium flex items-center text-agrifirm-black">
              <Calendar className="h-4 w-4 mr-2 text-agrifirm-green" />
              Calendar
            </h3>
          </div>
          <div className="p-4">
            <ReactCalendar
              onChange={handleDateChange}
              value={date}
              tileContent={tileContent}
              className="border-none shadow-none w-full"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 overflow-hidden">
          <div className="bg-agrifirm-light-yellow-2/30 px-4 py-3 border-b border-agrifirm-light-green/10">
            <h3 className="font-medium flex items-center text-agrifirm-black">
              <Filter className="h-4 w-4 mr-2 text-agrifirm-green" />
              Filter Events
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Event Type</label>
              <Select onValueChange={handleEventTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planting">Planting</SelectItem>
                  <SelectItem value="harvesting">Harvesting</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={applyFilters} 
                className="bg-agrifirm-green text-white w-full"
              >
                Apply Filters
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                className="border-agrifirm-grey/30 w-full"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 overflow-hidden h-full">
          <div className="bg-agrifirm-light-yellow-2/30 px-4 py-3 border-b border-agrifirm-light-green/10">
            <h2 className="font-medium text-agrifirm-black">
              {isFilterActive
                ? 'Filtered Events'
                : selectedDate
                  ? `Events for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'All Events'}
            </h2>
          </div>
          
          <ScrollArea className="p-4 h-[calc(100vh-300px)] min-h-[400px] w-full">
            {filteredEvents.length > 0 ? (
              <ul className="space-y-3">
                {filteredEvents.map(event => (
                  <li key={event.id} className="p-4 rounded-lg shadow-sm bg-white border border-gray-100 hover:border-agrifirm-light-green/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-agrifirm-black">{event.title}</h3>
                      <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-1 text-sm">{event.description}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge className={`${getEventTypeColor(event.type)} font-normal`}>
                        {event.type}
                      </Badge>
                      
                      <div className="flex-grow"></div>
                      
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Status:</span>
                        <Select
                          value={event.status}
                          onValueChange={(newStatus) => handleEventStatusChange(event.id, newStatus)}
                        >
                          <SelectTrigger className="h-8 min-h-8 pl-3 pr-2 py-0 min-w-[140px] bg-white border-gray-200">
                            <SelectValue>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(event.status || 'pending')}`}>
                                {event.status || 'Pending'}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                <Calendar className="h-12 w-12 mb-2 text-agrifirm-light-green/50" />
                <p>No events found for the selected criteria.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendar;
