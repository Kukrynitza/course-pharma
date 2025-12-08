export default async function sendMessageToAI(id: number, text: string){
  // return {text: 'Первые шаги'}
  // return {success: true, text: 'Первые шаги'}
  try {
    const response = await fetch('http://localhost:8000/api/medical/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: text,
        user_id: id,
        language: 'ru'
      }),
    })
    console.log(response)
    if (!response.ok) {
      throw new Error('Ошибка анализа')
    }
    const data = await response.json()
    console.log(data)
    return data.recommendations[0]
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Произошла ошибка при анализе')
  }
}