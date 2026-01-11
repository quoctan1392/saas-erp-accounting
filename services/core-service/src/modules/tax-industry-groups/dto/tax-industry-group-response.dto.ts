export class TaxIndustryGroupResponseDto {
  id: number;
  code: string;
  name: string;
  groupName: string;
  vatRate?: number | null;
  pitRate?: number | null;
}
