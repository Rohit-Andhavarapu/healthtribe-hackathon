import { TimelineEvent } from "@healthtribe/schemas";

export function groupTimelineByMonth(events: TimelineEvent[]) {
  if (!Array.isArray(events)) {
    console.error('groupTimelineByMonth: events is not an array', events);
    return [];
  }
  
  const grouped = events.reduce((acc, event) => {
    if (!event || !event.occurred_at) {
      console.warn('groupTimelineByMonth: skipping invalid event', event);
      return acc;
    }
    
    try {
      const date = new Date(event.occurred_at);
      if (isNaN(date.getTime())) {
        console.warn('groupTimelineByMonth: invalid date for event', event.id, event.occurred_at);
        return acc;
      }
      
      // e.g. "July 2026"
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(event);
    } catch (error) {
      console.error('groupTimelineByMonth: error processing event', event.id, error);
    }
    
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  // Sort groups by date descending
  return Object.entries(grouped).sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0;
    }
    return dateB.getTime() - dateA.getTime();
  });
}
