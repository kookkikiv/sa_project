export interface PackageInterface {
    ID?: number;
    name?: string;
    people?: number;
    start_date?: string;  // รองรับ ISO string format
    final_date?: string;  // รองรับ ISO string format  
    price?: number;
    guide_id?: number;
    province_id?: number;
    district_id?: number;
    subdistrict_id?: number;
    admin_id?: number;
    accommodation_package?: number;
    event_package?: number;
    
}