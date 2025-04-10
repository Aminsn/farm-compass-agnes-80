
import React, { useState, useEffect } from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { Event } from '@/types';
import { useEvents } from '@/context/EventContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalendarProps {
  events?: Event[];
}

const PlanningCalendar: React.FC<CalendarProps> = ({ events = [] }) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), null]);
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({});
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { updateEvent } = useEvents();
  
  // Date range filter inputs
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
  }, [events, dateRange, selectedEventType]);

  const filterEventsByDateRangeAndCriteria = (eventsToFilter: Event[]) => {
    let filtered = [...eventsToFilter];
    
    // Filter by date range if both dates are selected from calendar
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
    
    setFilteredEvents(filtered);
    setIsFilterActive(!!selectedEventType || (dateRange[0] !== null && dateRange[1] !== null));
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

  const clearFilters = () => {
    setDateRange([new Date(), null]);
    setSelectedEventType(null);
    setIsFilterActive(false);
    setFilteredEvents(events);
    setStartDate("");
    setEndDate("");
  };

  // New function to handle date range filter submission
  const handleDateRangeFilter = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set end time to end of day for inclusive filtering
      end.setHours(23, 59, 59, 999);
      
      setDateRange([start, end]);
      
      // Filter events based on the date range
      const filtered = events.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start, end });
      });
      
      setFilteredEvents(filtered);
      setIsFilterActive(true);
    }
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

  return (
    <div className="space-y-4">
      {/* Filters above calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-agrifirm-light-green/20 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="space-y-2 w-full">
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
          
          {/* Date Range Filter */}
          <div className="space-y-2 w-full md:col-span-2">
            <Label className="text-sm font-medium text-gray-700 block">Date Range</Label>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[120px]">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleDateRangeFilter}
                disabled={!startDate || !endDate}
                className="bg-agrifirm-green hover:bg-agrifirm-green/90"
              >
                Apply
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                className="border-agrifirm-grey/30"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Changed grid layout to give more space to the events sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar - narrower (2 cols instead of 3) */}
        <div className="md:col-span-2 space-y-4">
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
        
        {/* Events list - wider (1 col instead of being squeezed) */}
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
                      
                      <div className="mt-2">
                        <Badge className={`${getEventTypeColor(event.type)} text-xs w-fit`}>
                          {event.type}
                        </Badge>
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
