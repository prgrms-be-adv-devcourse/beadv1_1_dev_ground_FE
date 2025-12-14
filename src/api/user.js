import api from '.'

export const getUserIds = async () => {
  try {
    const { data } = await api.get('/User/GetUserIds')
    return data.data
  } catch (error) {
    console.log(error)
  }
}
