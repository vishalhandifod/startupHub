import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createStartup, getStartups } from '../api/startups'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Modal from '../components/common/Modal.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import StartupCard from '../components/startup/StartupCard.jsx'
import StartupForm from '../components/startup/StartupForm.jsx'
import { getErrorMessage } from '../utils/apiError.js'

export default function StartupsPage() {
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [creatingStartup, setCreatingStartup] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      try {
        const data = await getStartups()
        if (!ignore) {
          setStartups(data)
        }
      } catch (error) {
        showToast({
          title: 'Startups unavailable',
          message: getErrorMessage(error, 'The startup directory could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [showToast])

  async function handleCreate(payload) {
    setCreatingStartup(true)
    try {
      const created = await createStartup(payload)
      setStartups((current) => [created, ...current])
      setCreating(false)
      showToast({
        title: 'Startup created',
        message: `${created.name} is now live in the StartupHub directory.`,
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Creation failed',
        message: getErrorMessage(error, 'The startup could not be created.'),
        tone: 'error',
      })
    } finally {
      setCreatingStartup(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="page-title">Startups</h1>
            <p className="mt-2 subtle-text">Explore founder-led companies building in fintech, AI, climate, and beyond.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Create Startup
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonLoader className="h-64" />
          <SkeletonLoader className="h-64" />
          <SkeletonLoader className="h-64" />
        </div>
      ) : (
        startups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No startups yet"
            message="Create the first startup page to start building your company presence."
            actionLabel="Create startup"
            onAction={() => setCreating(true)}
          />
        )
      )}

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Create startup page">
        <StartupForm onSubmit={handleCreate} submitLabel={creatingStartup ? 'Creating...' : 'Create startup page'} />
      </Modal>
    </div>
  )
}
