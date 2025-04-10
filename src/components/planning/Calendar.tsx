
import React, { useState, useEffect } from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isWithinInterval, parseISO } from 'date-fns';
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
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), null]);
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({});
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
    filterEventsByDateRangeAndCriteria(events);
  }, [events, dateRange, selectedEventType, selectedStatus]);

  const filterEventsByDateRangeAndCriteria = (eventsToFilter: Event[]) => {
    let filtered = [...eventsToFilter];
    
    // Filter by date range if both dates are selected
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { 
          start: dateRange[0]!, 
          end: dateRange[1]! 
        });
      });
    } else if (dateRange[0] && !dateRange[1]) {
      // If only first date is selected, show events for that specific day
      const dateString = format(dateRange[0], 'yyyy-MM-dd');
      filtered = eventsByDate[dateString] || [];
    }
    
    // Apply type filter
    if (selectedEventType) {
      filtered = filtered.filter(event => event.type === selectedEventType);
    }
    
    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }
    
    setFilteredEvents(filtered);
    setIsFilterActive(!!selectedEventType || !!selectedStatus || (dateRange[0] !== null && dateRange[1] !== null));
  };

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

  const handleDateChange = (value: Date | [Date | null, Date | null]) => {
    if (Array.isArray(value)) {
      setDateRange(value);
    } else {
      setDateRange([value, null]);
    }
  };

  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType === "all" ? null : eventType);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status === "all" ? null : status);
  };

  const clearFilters = () => {
    setDateRange([new Date(), null]);
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
      case 'visit':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'conference':
        return 'bg-purple-100 text-purple-800';
      case 'review':
        return 'bg-orange-100 text-orange-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'demonstration':
        return 'bg-indigo-100 text-indigo-800';
      case 'reporting':
        return 'bg-red-100 text-red-800';
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
    <div className="space-y-4">
      {/* Filters above calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-medium text-gray-700 block">Event Type</label>
            <Select value={selectedEventType || "all"} onValueChange={handleEventTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="visit">Farm Visit</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="review">Client Review</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="demonstration">Demonstration</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-medium text-gray-700 block">Status</label>
            <Select value={selectedStatus || "all"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-initial mt-auto">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="border-agrifirm-grey/30 h-10"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Calendar - wider (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 overflow-hidden">
            <div className="bg-agrifirm-light-yellow-2/30 px-4 py-3 border-b border-agrifirm-light-green/10">
              <h3 className="font-medium flex items-center text-agrifirm-black">
                <Calendar className="h-4 w-4 mr-2 text-agrifirm-green" />
                Calendar {dateRange[0] && dateRange[1] && `(${format(dateRange[0], 'MMM dd')} - ${format(dateRange[1], 'MMM dd')})`}
              </h3>
            </div>
            <div className="p-4 flex justify-center">
              <ReactCalendar
                onChange={handleDateChange}
                value={dateRange}
                selectRange={true}
                tileContent={tileContent}
                className="border-none shadow-none w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Events list - slimmer (1 col) */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 overflow-hidden h-full">
            <div className="bg-agrifirm-light-yellow-2/30 px-4 py-3 border-b border-agrifirm-light-green/10">
              <h2 className="font-medium text-agrifirm-black text-sm">
                {isFilterActive
                  ? 'Filtered Events'
                  : dateRange[0] && !dateRange[1]
                    ? `Events for ${format(dateRange[0], 'MMM d, yyyy')}`
                    : 'All Events'}
              </h2>
            </div>
            
            <ScrollArea className="p-3 h-[calc(100vh-350px)] min-h-[400px] w-full">
              {filteredEvents.length > 0 ? (
                <ul className="space-y-3">
                  {filteredEvents.map(event => (
                    <li key={event.id} className="p-3 rounded-lg shadow-sm bg-white border border-gray-100 hover:border-agrifirm-light-green/30 transition-colors">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-agrifirm-black text-sm">{event.title}</h3>
                        <span className="text-xs text-gray-500 font-medium">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mt-1 text-xs line-clamp-2">{event.description}</p>
                      
                      <div className="mt-2 flex flex-col gap-1.5">
                        <Badge className={`${getEventTypeColor(event.type)} text-xs w-fit`}>
                          {event.type}
                        </Badge>
                        
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">Status:</span>
                          <Select
                            value={event.status}
                            onValueChange={(newStatus) => handleEventStatusChange(event.id, newStatus)}
                          >
                            <SelectTrigger className="h-6 min-h-6 pl-2 pr-1 py-0 text-xs min-w-[100px] bg-white border-gray-200">
                              <SelectValue>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${getStatusColor(event.status || 'pending')}`}>
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
                  <Calendar className="h-10 w-10 mb-2 text-agrifirm-light-green/50" />
                  <p className="text-sm text-center">No events found for the selected criteria.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendar;
