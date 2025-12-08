export default async function sendMessageToAI(id: number, text: string, chat: number){
  // return {success: true, text: 'Первые шаги'}
  try {
    const response = await fetch('http://localhost:8000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
		message: text,
    chat,
		method: "content",
		top_n: 5
      }),
    })
    console.log(response)
    if (!response.ok) {
      throw new Error('Ошибка анализа')
    }
    const data = await response.json()
    return {success: true, text: data.response}
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Произошла ошибка при анализе')
  }
}