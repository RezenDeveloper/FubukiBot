interface MALData {
    request_hash: string
    request_cached: boolean
    request_cache_expiry: number
}
interface MALSearchData extends MALData {
    results: MALSearchAnime[]
    last_page: number
}
interface MALError {
    status: number
    type: string
    message: string
    error: any
}

interface MALSearchAnime {
    mal_id: number
    url: string
    image_url: string
    title: string
    airing: boolean
    synopsis: string
    type: string
    episodes: number
    score: number
    start_date: string
    end_date: string
    members: number
    rated: string
}
interface MALAnime extends MALData {
    mal_id: number
    url: string
    image_url: string
    title: string
    airing: boolean
    synopsis: string
    type: string
    episodes: number
    score: number
    members: number
    trailer_url: string
    title_english: string
    title_japanese: string
    title_synonyms: string[]
    source: string
    status: string
    aired: {
        from: string
        to: string
        prop:{
            from: dateObj
            to: dateObj
        }
        string: string
    }
    duration: string
    rating: string
    scored_by: number
    rank: number
    popularity: number
    favorites: number
    synopsis: string
    background: any
    premiered: string
    broadcast: string
    related: {
        Adaptation: RelatedInfo[]
    }
    producers: RelatedInfo[]
    licensors: RelatedInfo[]
    studios: RelatedInfo[]
    genres: RelatedInfo[]
    opening_themes: string[]
    ending_themes: string[]

}
interface RelatedInfo {
    mal_id: number
    type: string
    name: string
    url: string
}
interface dateObj {
    day: number
    month: number
    year: number
}