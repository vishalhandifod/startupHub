import api from './axiosInstance'

async function upload(file, endpoint) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.path
}

export function uploadProfilePhoto(file) {
  return upload(file, '/uploads/profile-photo')
}

export function uploadPostImage(file) {
  return upload(file, '/uploads/post-image')
}

export function uploadStartupLogo(file) {
  return upload(file, '/uploads/startup-logo')
}
