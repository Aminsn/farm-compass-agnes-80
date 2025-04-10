
import React, { useState, useMemo } from "react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  X 
} from "lucide-react";
import { useEvents } from "@/context/EventContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval, parseISO } from "date-fns";

// Get event type color function
const getEventTypeColor = (type: string) => {
  switch (type) {
    case "planting":
      return "bg-agrifirm-light-green";
    case "irrigation":
      return "bg-blue-400";
    case "fertilizing":
      return "bg-agrifirm-brown-light";
    case "harvesting":
      return "bg-agrifirm-yellow";
    case "maintenance":
      return "bg-agrifirm-grey";
    default:
      return "bg-agrifirm-light-yellow";
  }
};

const eventTypes = [
  { value: "all", label: "All Types" },
  { value: "planting", label: "Planting" },
  { value: "irrigation", label: "Irrigation" },
  { value: "fertilizing", label: "Fertilizing" },
  { value: "harvesting", label: "Harvesting" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" }
];

const PlanningCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const { events } = useEvents();
  
  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);

  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const selectedDateEvents = getEventsForDate(date);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    
    // Apply date range filter
    if (dateRange && dateRange.from) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(
          event.date.getFullYear(),
          event.date.getMonth(),
          event.date.getDate()
        );
        
        if (dateRange.to) {
          return isWithinInterval(eventDate, { 
            start: dateRange.from, 
            end: dateRange.to 
          });
        } else {
          // If only start date is provided
          const fromDate = new Date(
            dateRange.from.getFullYear(),
            dateRange.from.getMonth(),
            dateRange.from.getDate()
          );
          return eventDate >= fromDate;
        }
      });
    }
    
    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.type === selectedType);
    }
    
    return filtered;
  }, [events, dateRange, selectedType]);

  const getCurrentMonthEvents = () => {
    if (!date) return [];
    
    let monthEvents = filteredEvents.filter(event => 
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
    
    return monthEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const eventDays = useMemo(() => {
    return filteredEvents.map(event => 
      new Date(
        event.date.getFullYear(),
        event.date.getMonth(),
        event.date.getDate()
      )
    );
  }, [filteredEvents]);

  const currentMonthEvents = getCurrentMonthEvents();

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedType("all");
    setIsFilterActive(false);
  };

  // Update filter active state when filters change
  React.useEffect(() => {
    const isActive = (dateRange && dateRange.from) || selectedType !== "all";
    setIsFilterActive(isActive);
  }, [dateRange, selectedType]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-agrifirm-black">Farm Planning</h1>
        <div className="flex gap-2">
          <Button 
            variant={view === "calendar" ? "default" : "outline"}
            className={view === "calendar" ? "bg-agrifirm-green text-white" : ""}
            onClick={() => setView("calendar")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Calendar
          </Button>
          <Button 
            variant={view === "list" ? "default" : "outline"}
            className={view === "list" ? "bg-agrifirm-green text-white" : ""}
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <span>Filters active</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter Events
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Options</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger id="event-type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="border rounded-md p-3">
                    <CalendarUI
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      className="p-0"
                    />
                  </div>
                  {dateRange?.from && (
                    <div className="text-sm">
                      {dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        <>From {format(dateRange.from, "MMM d, yyyy")}</>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-agrifirm-green hover:bg-agrifirm-green/90"
                    onClick={() => setIsFilterActive(true)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{formatMonthYear(date || new Date())}</CardTitle>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date!);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date!);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setDate(newDate);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDate(new Date())}
                  >
                    Today
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  highlighted: eventDays,
                }}
                modifiersClassNames={{
                  highlighted: "bg-agrifirm-light-yellow-2 font-bold text-black",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                {date ? date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Select a date'}
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                        <span className="font-medium">{event.title}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-agrifirm-grey mt-1 ml-5">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-agrifirm-grey">
                  <p>No events scheduled for this day</p>
                  <Button className="mt-2 farm-button-secondary" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{formatMonthYear(date || new Date())} Events</CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date!);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date!);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentMonthEvents.length > 0 ? (
              <div className="space-y-4">
                {currentMonthEvents.map(event => (
                  <div key={event.id} className="border-b border-agrifirm-light-green/20 pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                      <span className="font-medium text-agrifirm-black">{event.title}</span>
                    </div>
                    <div className="ml-5 mt-1">
                      <p className="text-sm text-agrifirm-brown-dark">
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {event.description && (
                        <p className="text-sm text-agrifirm-grey mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-agrifirm-grey">
                <p>No events scheduled for this month</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanningCalendar;
