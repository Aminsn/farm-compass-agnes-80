import React, { useState, useEffect } from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Event } from '@/types';
import { useEvent } from '@/context/EventContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CalendarProps {
  events: Event[];
}

const PlanningCalendar: React.FC<CalendarProps> = ({ events }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({});
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { updateEvent } = useEvent();

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
          <div className="flex justify-center items-center h-6 w-6 bg-agrifirm-green text-white rounded-full text-xs">
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
      // Fix the type error by explicitly passing a boolean
      setIsFilterActive(true);
    } else if (selectedEventType) {
      setFilteredEvents(events.filter(event => event.type === selectedEventType));
      // Fix the type error by explicitly passing a boolean
      setIsFilterActive(true);
    } else if (selectedStatus) {
      setFilteredEvents(events.filter(event => event.status === selectedStatus));
      // Fix the type error by explicitly passing a boolean
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

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/3">
        <ReactCalendar
          onChange={handleDateChange}
          value={date}
          tileContent={tileContent}
          className="rounded-lg shadow-md"
        />
        <div className="mt-4 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Filter Events</h3>
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
          <Select className="mt-2" onValueChange={handleStatusChange}>
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
          <div className="mt-4 flex gap-2">
            <button onClick={applyFilters} className="bg-agrifirm-green text-white py-2 px-4 rounded hover:bg-agrifirm-green/80">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-semibold mb-2">
          {isFilterActive
            ? 'Filtered Events'
            : selectedDate
              ? `Events for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'All Events'}
        </h2>
        <ScrollArea className="rounded-md border p-4 h-[400px] w-full">
          {filteredEvents.length > 0 ? (
            <ul className="space-y-2">
              {filteredEvents.map(event => (
                <li key={event.id} className="p-4 rounded-lg shadow-sm bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{event.title}</h3>
                    <span className="text-sm text-gray-500">{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                      {event.type}
                    </span>
                    <Select
                      value={event.status}
                      onValueChange={(newStatus) => handleEventStatusChange(event.id, newStatus)}
                    >
                      <SelectTrigger className="w-[180px]">
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
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found for the selected date.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PlanningCalendar;
