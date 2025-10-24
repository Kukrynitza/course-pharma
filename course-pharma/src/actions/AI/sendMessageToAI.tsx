export default async function sendMessageToAI(text: string){
  return {text: 'Первые шаги'}
  // return {success: true, text: 'Первые шаги'}
  try {
    const response = await fetch('http://localhost:8000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: text
      }),
    })
    console.log(response)
    
    const data = await response.json()
    return data
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Произошла ошибка при анализе')
  }
}