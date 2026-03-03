'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from '@/lib/actions/recipes'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteRecipeButtonProps {
  recipeId: number
}

export function DeleteRecipeButton({ recipeId }: DeleteRecipeButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      await deleteRecipe(recipeId)
      router.push('/meals/rezepte')
    })
  }

  return (
    <Button
      variant={confirming ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      disabled={isPending}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Wird gelöscht...' : confirming ? 'Wirklich löschen?' : 'Löschen'}
    </Button>
  )
}
