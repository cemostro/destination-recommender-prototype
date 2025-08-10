import { create } from 'zustand'

const useTravelRecommenderStore = create((set) => ({
    countries: [],
    userData: {
        isPriceImportant: false,
        Budget: 60,
        Months: Array(12).fill(0),
        PresetType: [],
        CompassPosition: { x: 0, y: 0 },
        PreferenceMode: "radar",
        AlgorithmWeights: [100, 0, 0],
        PopularityToggle: "popular",
        Attributes: {
            Nature: {
                weight: 1,
                score: 50,
            },
            Architecture: {
                weight: 1,
                score: 50,
            },
            Hiking: {
                weight: 1,
                score: 50,
            },
            Wintersports: {
                weight: 1,
                score: 50,
            },
            Beach: {
                weight: 1,
                score: 50,
            },
            Culture: {
                weight: 1,
                score: 50,
            },
            Culinary: {
                weight: 1,
                score: 50,
            },
            Entertainment: {
                weight: 1,
                score: 50,
            },
            Shopping: {
                weight: 1,
                score: 50,
            },
        },
    },
    results: [],
    setCountries: (newCountries) => set({ countries: newCountries }),
    setUserData: (newUserData) => set({ userData: newUserData }),
    setResults: (newResults) => set({ results: newResults }),
}));

export default useTravelRecommenderStore;
