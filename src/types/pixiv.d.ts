declare module 'pixiv-api-client'
declare module 'pixichan'

interface PixivRequestError {
    has_error: boolean
    errors: { 
        system: { 
            message: string 
            code: number 
        } 
    }
    error: string
}
interface IRefreshResponse {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
    refresh_token: string
    user: IPixivUser
}

interface IPixivUser {
    id: string
    name: string
    account: string
    profile_image_urls: {
        px_16x16: string
        px_50x50: string
        px_170x170: string
    },
    is_followed: boolean
}

interface IPixivSelfUser extends IPixivUser{
    mail_address: string
    is_mail_authorized: boolean
    is_premium: boolean
    x_restrict: number
    require_policy_agreement: boolean
    is_followed: undefined
}

interface ISearchResponse {
    illusts: IIllust[]
    next_url: string
    search_span_limit: number
}

interface IIllust {
    id: number
    title: string
    type: string
    image_urls: {
        square_medium: string
        medium: string
        large: string
    }
    caption: string
    restrict: number
    user: IPixivUser
    tags: {
        name: string
        translated_name: string
    }[]
    tools: string[]
    create_date: string
    page_count: number
    width: number
    height: number
    sanity_level: number
    x_restrict: number
    series: unknown
    meta_single_page: {
        original_image_url: string
    }
    meta_pages: {
        image_urls:{
            square_medium: string
            medium: string
            large: string
            original: string
        }
    }[]
    total_view: number
    total_bookmarks: number
    is_bookmarked: boolean
    visible: boolean
    is_muted: boolean
    total_comments?: number
}