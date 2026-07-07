import { useQuery } from '@tanstack/react-query';
import { listTimelineEventsApiV1TimelineGet } from '@healthtribe/api-client';
import { TimelineFilters, TimelineEvent } from '../types/timeline';

export function useTimeline(params: Partial<TimelineFilters> & { patientId?: string }) {
  const { searchQuery = '', selectedType = null, selectedStatus = null, patientId } = params;

  return useQuery({
    queryKey: ['timeline', params],
    queryFn: async () => {
      const response = await listTimelineEventsApiV1TimelineGet({
        query: {
          patient_id: patientId,
        }
      });
      
      if (response.error) {
        console.error('Timeline fetch error:', response.error);
        throw new Error(String(response.error));
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Timeline data is not an array:', response.data);
        return [];
      }
      
      let events = (response.data || []) as TimelineEvent[];
      
      if (selectedType) {
        events = events.filter(e => e && e.type === selectedType);
      }

      if (selectedStatus) {
        events = events.filter(e => e && e.status === selectedStatus);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        events = events.filter(e => {
          if (!e) return false;
          return (
            (e.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
            (e.type || '').includes(query) ||
            (e.source || '').toLowerCase().includes(query)
          );
        });
      }
      
      return events;
    }
  });
}
