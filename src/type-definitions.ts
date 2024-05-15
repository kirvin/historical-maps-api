// @TODO figure out how to automatically derive these types from schema definition above
type FeatureInput = {
  id: string
  title: string
  type: string
  regions: Array<GeoRegionInput>
  slices: Array<FeatureSliceInput>
}

type GeoRegionInput = {
  key: string
}

type FeatureSliceInput = {
  id: string
  featureId: string
  startYear: number
  endYear: number
  coordinates: string
}

export { FeatureInput, GeoRegionInput, FeatureSliceInput };