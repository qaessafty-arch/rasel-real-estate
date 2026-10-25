import { useState, useMemo } from 'react';
import { Property, PropertyDivision } from '@/types';

export function usePropertyFilters(properties: Property[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedAreaRange, setSelectedAreaRange] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<PropertyDivision>('all');

  // Dynamically extract available cities
  const availableCities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(set);
  }, [properties]);

  const isFilterActive =
    selectedType !== 'all' ||
    selectedPurpose !== 'all' ||
    selectedPayment !== 'all' ||
    selectedCondition !== 'all' ||
    selectedStatus !== 'all' ||
    selectedCity !== 'all' ||
    selectedAreaRange !== 'all' ||
    Boolean(searchQuery.trim());

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedPurpose('all');
    setSelectedPayment('all');
    setSelectedCondition('all');
    setSelectedStatus('all');
    setSelectedCity('all');
    setSelectedAreaRange('all');
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchCode = item.property_code?.toLowerCase().includes(query);
        const matchCity = item.city?.toLowerCase().includes(query);
        const matchNeigh = item.neighborhood?.toLowerCase().includes(query);
        const matchAddress = item.address?.toLowerCase().includes(query);
        const matchProject = item.project_name?.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        const matchOwner = item.owner_contact?.name?.toLowerCase().includes(query);
        const matchFreelancer = item.freelancer_name?.toLowerCase().includes(query);
        const matchFeatures = item.features?.some((f) => f.toLowerCase().includes(query));

        if (
          !matchTitle &&
          !matchCode &&
          !matchCity &&
          !matchNeigh &&
          !matchAddress &&
          !matchProject &&
          !matchNotes &&
          !matchOwner &&
          !matchFreelancer &&
          !matchFeatures
        ) {
          return false;
        }
      }

      // 2. Property Type
      if (selectedType !== 'all' && item.property_type !== selectedType) {
        return false;
      }

      // 3. Purpose
      if (selectedPurpose !== 'all' && item.purpose !== selectedPurpose) {
        return false;
      }

      // 4. Payment Method
      if (selectedPayment !== 'all') {
        if (item.payment_method) {
          if (item.payment_method !== selectedPayment) return false;
        } else {
          if (selectedPayment === 'installments' && !item.installment_count) return false;
        }
      }

      // 5. Condition
      if (selectedCondition !== 'all') {
        if (item.condition && item.condition !== selectedCondition) {
          return false;
        }
      }

      // 6. Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // 7. City
      if (selectedCity !== 'all' && item.city !== selectedCity) {
        return false;
      }

      // 8. Area Range
      if (selectedAreaRange !== 'all') {
        if (selectedAreaRange === 'under_200' && item.area_sqm >= 200) return false;
        if (selectedAreaRange === '200_500' && (item.area_sqm < 200 || item.area_sqm > 500)) return false;
        if (selectedAreaRange === '500_2500' && (item.area_sqm < 500 || item.area_sqm >= 2500)) return false;
        if (
          selectedAreaRange === 'donum_plus' &&
          item.area_sqm < 2500 &&
          (!item.land_details?.area_donum || item.land_details.area_donum <= 0)
        ) {
          return false;
        }
      }

      // 9. Category Division
      if (selectedDivision !== 'all') {
        const resTypes = ['house', 'villa', 'apartment'];
        const landTypes = ['residential_land', 'commercial_land', 'agricultural_land', 'agriculture_land', 'industrial_land', 'farm'];
        const commTypes = ['shop', 'office', 'building', 'warehouse', 'showroom'];

        if (selectedDivision === 'residential' && !resTypes.includes(item.property_type)) return false;
        if (selectedDivision === 'land' && !landTypes.includes(item.property_type)) return false;
        if (selectedDivision === 'commercial' && !commTypes.includes(item.property_type)) return false;
        if (selectedDivision === 'projects' && !item.project_name && item.property_type !== 'building') return false;
      }

      return true;
    });
  }, [
    properties,
    searchQuery,
    selectedType,
    selectedPurpose,
    selectedPayment,
    selectedCondition,
    selectedStatus,
    selectedCity,
    selectedAreaRange,
    selectedDivision,
  ]);

  // Listings by Division
  const divisionLists = useMemo(() => {
    const resTypes = ['house', 'villa', 'apartment'];
    const landTypes = ['residential_land', 'commercial_land', 'agricultural_land', 'agriculture_land', 'industrial_land', 'farm'];
    const commTypes = ['shop', 'office', 'building', 'warehouse', 'showroom'];

    return {
      all: properties,
      residential: properties.filter((p) => resTypes.includes(p.property_type)),
      land: properties.filter((p) => landTypes.includes(p.property_type)),
      commercial: properties.filter((p) => commTypes.includes(p.property_type)),
      projects: properties.filter((p) => Boolean(p.project_name) || p.property_type === 'building'),
    };
  }, [properties]);

  const divisionCounts = useMemo(() => ({
    all: divisionLists.all.length,
    residential: divisionLists.residential.length,
    land: divisionLists.land.length,
    commercial: divisionLists.commercial.length,
    projects: divisionLists.projects.length,
  }), [divisionLists]);

  // A listing photo per division for the public "browse by type" tiles, not repeating a photo
  // another tile already uses (a project can also count as residential or commercial).
  const divisionCovers = useMemo(() => {
    const used = new Set<string>();
    const cover = (list: Property[]) => {
      const imgs = list.map((p) => p.images?.[0]).filter(Boolean) as string[];
      const pick = imgs.find((i) => !used.has(i)) ?? imgs[0];
      if (pick) used.add(pick);
      return pick;
    };
    return {
      residential: cover(divisionLists.residential),
      land: cover(divisionLists.land),
      commercial: cover(divisionLists.commercial),
      projects: cover(divisionLists.projects),
    };
  }, [divisionLists]);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedPurpose,
    setSelectedPurpose,
    selectedPayment,
    setSelectedPayment,
    selectedCondition,
    setSelectedCondition,
    selectedStatus,
    setSelectedStatus,
    selectedCity,
    setSelectedCity,
    selectedAreaRange,
    setSelectedAreaRange,
    selectedDivision,
    setSelectedDivision,
    availableCities,
    isFilterActive,
    resetFilters,
    filteredProperties,
    divisionCounts,
    divisionCovers,
  };
}
