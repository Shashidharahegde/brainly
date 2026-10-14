import { fetchTranscript } from 'youtube-transcript';


export async function youtubeTransctipt(url){

    try {
        const youtubeTranscript = await fetchTranscript(url)

    return youtubeTransctipt
        
    } catch (error) {
        console.log("error while scrapping YoutubeTranscript", error)
    }
   
}