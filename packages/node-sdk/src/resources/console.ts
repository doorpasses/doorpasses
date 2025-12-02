import { HttpClient } from '../http-client';
import {
  CardTemplate,
  CreateCardTemplateParams,
  UpdateCardTemplateParams,
  EventLogEntry,
  ReadEventLogParams,
} from '../types';

/**
 * Console resource for managing card templates (Enterprise only)
 */
export class Console {
  private http: HttpClient;

  constructor(httpClient: HttpClient) {
    this.http = httpClient;
  }

  /**
   * Create a new card template
   * @param params - Parameters for creating the card template
   * @returns The created card template
   * @requires Enterprise tier
   */
  async createTemplate(params: CreateCardTemplateParams): Promise<CardTemplate> {
    return this.http.post<CardTemplate>('/v1/console/card-templates', params);
  }

  /**
   * Read a card template
   * @param cardTemplateId - The ID of the card template to read
   * @returns The card template
   * @requires Enterprise tier
   */
  async readTemplate(cardTemplateId: string): Promise<CardTemplate> {
    return this.http.get<CardTemplate>(
      `/v1/console/card-templates/${cardTemplateId}`,
      { id: cardTemplateId }
    );
  }

  /**
   * Update a card template
   * @param params - Parameters for updating the card template
   * @returns The updated card template
   * @requires Enterprise tier
   */
  async updateTemplate(params: UpdateCardTemplateParams): Promise<CardTemplate> {
    const { cardTemplateId, ...updateData } = params;
    return this.http.patch<CardTemplate>(
      `/v1/console/card-templates/${cardTemplateId}`,
      updateData
    );
  }

  /**
   * Publish a card template
   * @param cardTemplateId - The ID of the card template to publish
   * @returns Success response
   * @requires Enterprise tier
   */
  async publishTemplate(cardTemplateId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/v1/console/card-templates/${cardTemplateId}/publish`);
  }

  /**
   * Read event logs for a card template
   * @param params - Parameters for filtering event logs
   * @returns Array of event log entries
   * @requires Enterprise tier
   */
  async eventLog(params: ReadEventLogParams): Promise<EventLogEntry[]> {
    const { cardTemplateId, filters } = params;
    const sigPayload: Record<string, any> = { id: cardTemplateId };

    if (filters) {
      if (filters.device) sigPayload.device = filters.device;
      if (filters.startDate) sigPayload.start_date = filters.startDate;
      if (filters.endDate) sigPayload.end_date = filters.endDate;
      if (filters.eventType) sigPayload.event_type = filters.eventType;
    }

    return this.http.get<EventLogEntry[]>(
      `/v1/console/card-templates/${cardTemplateId}/logs`,
      sigPayload
    );
  }
}
