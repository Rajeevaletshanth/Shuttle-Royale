"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Check, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CoinTossProps {
  onClose: () => void
  onConfirmGroups: (groupA: Team[], groupB: Team[]) => void
}

interface Team {
  id: number
  name: string
  logo: string
  group?: "A" | "B" | null
}

export default function CoinToss({ onClose, onConfirmGroups }: CoinTossProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<"heads" | "tails" | null>(null)
  const [flipKey, setFlipKey] = useState(0) // Key to force animation reset
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "Sharks", logo: "/team-logos/Sharks.png", group: null },
    { id: 2, name: "Birdies", logo: "/team-logos/Birdies.png", group: null },
    { id: 3, name: "Lambert's Smash", logo: "/team-logos/Lambert's Smash.png", group: null },
    { id: 4, name: "Exbolts", logo: "/team-logos/Exbolts.png", group: null },
    { id: 5, name: "Red Dragon", logo: "/team-logos/Red Dragon.png", group: null },
    { id: 6, name: "Power Boys", logo: "/team-logos/Power Boys.png", group: null },
    { id: 7, name: "Racket Gun Mafia", logo: "/team-logos/RGM.png", group: null },
    { id: 8, name: "DCSL Wolves", logo: "/team-logos/DCSL Wolves.png", group: null },
    { id: 9, name: "Kitchen Masters", logo: "/team-logos/Kitchen Masters.png", group: null },
  ])
  const [step, setStep] = useState<"select" | "flip" | "result" | "confirm">("select")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Count teams in each group
  const groupACounts = teams.filter((t) => t.group === "A").length
  const groupBCounts = teams.filter((t) => t.group === "B").length
  const unassignedCount = teams.filter((t) => t.group === null).length

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/coin-flip.mp3")

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const flipCoin = () => {
    if (isFlipping || !selectedTeam) return

    setIsFlipping(true)
    setResult(null)
    setStep("flip")

    // Increment key to force animation reset
    setFlipKey((prev) => prev + 1)

    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => console.error("Error playing sound:", err))
    }

    // Check if any group is full (5 teams)
    const isGroupAFull = groupACounts >= 5
    const isGroupBFull = groupBCounts >= 5

    // Determine the result - if a group is full, auto-assign to the other group
    let randomResult: "heads" | "tails"
    if (isGroupAFull) {
      randomResult = "heads" // Force Group B
    } else if (isGroupBFull) {
      randomResult = "tails" // Force Group A
    } else {
      randomResult = Math.random() > 0.5 ? "heads" : "tails"
    }

    // Set the result after animation
    setTimeout(() => {
      setResult(randomResult)
      setIsFlipping(false)
      setStep("result")

      // Assign team to group based on result
      const updatedTeams:any = teams.map((team) => {
        if (team.id === selectedTeam.id) {
          return {
            ...team,
            group: randomResult === "heads" ? "B" : "A",
          }
        }
        return team
      })

      setTeams(updatedTeams)
      setSelectedTeam({
        ...selectedTeam,
        group: randomResult === "heads" ? "B" : "A",
      })
    }, 1500)
  }

  const resetSelection = () => {
    setSelectedTeam(null)
    setResult(null)
    setStep("select")
  }

  const confirmGroups = () => {
    const groupA = teams.filter((team) => team.group === "A")
    const groupB = teams.filter((team) => team.group === "B")
    onConfirmGroups(groupA, groupB)
    onClose()
  }

  // Auto-assign remaining teams if one group is full
  const autoAssignRemainingTeams = () => {
    if (unassignedCount === 0) return

    const isGroupAFull = groupACounts >= 5
    const isGroupBFull = groupBCounts >= 5

    if (!isGroupAFull && !isGroupBFull) return // Only auto-assign if one group is full

    const targetGroup = isGroupAFull ? "B" : "A"

    const updatedTeams:any = teams.map((team) => {
      if (team.group === null) {
        return { ...team, group: targetGroup }
      }
      return team
    })

    setTeams(updatedTeams)
  }

  // Check if all teams are assigned
  useEffect(() => {
    if (unassignedCount === 0 && (step === "select" || step === "result")) {
      setStep("confirm")
    }

    // Auto-assign remaining teams if one group is full
    if ((groupACounts >= 5 || groupBCounts >= 5) && unassignedCount > 0) {
      autoAssignRemainingTeams()
    }
  }, [teams, step, groupACounts, groupBCounts, unassignedCount])

  const renderTeamSelection = () => (
    <div className="w-full max-h-[400px] overflow-y-auto pr-2">
      <div className="flex justify-between mb-4">
        <Badge variant="outline" className="px-3 py-1">
          Group A: {groupACounts}/5
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Group B: {groupBCounts}/5
        </Badge>
      </div>

      {(groupACounts >= 5 || groupBCounts >= 5) && unassignedCount > 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {groupACounts >= 5
              ? "Group A is full. Remaining teams will be assigned to Group B."
              : "Group B is full. Remaining teams will be assigned to Group A."}
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup
        value={selectedTeam?.id.toString()}
        onValueChange={(value) => {
          const team = teams.find((t) => t.id.toString() === value)
          setSelectedTeam(team || null)
        }}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            className={`flex items-center space-x-2 p-2 rounded-md mb-2 ${team.group ? "opacity-50" : "hover:bg-accent"}`}
          >
            <RadioGroupItem value={team.id.toString()} id={`team-${team.id}`} disabled={!!team.group} />
            <Label htmlFor={`team-${team.id}`} className="flex items-center flex-1 cursor-pointer">
              <div className="w-10 h-10 relative mr-3">
                <Image src={team.logo || "/placeholder.svg"} alt={team.name} fill className="object-contain" />
              </div>
              <span className="flex-1">{team.name}</span>
              {team.group && <Badge>{`Group ${team.group}`}</Badge>}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  const renderCoinFlip = () => (
    <div className="flex flex-col items-center">
      <div className="perspective-container mb-6">
        <div
          key={flipKey}
          className={`coin ${result === "heads" ? "coin-flip-heads" : result === "tails" ? "coin-flip-tails" : "coin-flip-random"}`}
        >
          {/* Heads side */}
          <div className="coin-side coin-heads">
            <Image
              src="/coin-heads.png"
              alt="Heads"
              width={150}
              height={150}
              className="rounded-full border border-muted-foreground/20 shadow-md"
            />
          </div>

          {/* Tails side */}
          <div className="coin-side coin-tails">
            <Image
              src="/coin-tails.png"
              alt="Tails"
              width={150}
              height={150}
              className="rounded-full border border-muted-foreground/20 shadow-md"
            />
          </div>
        </div>
      </div>

      {isFlipping && <p className="text-sm text-muted-foreground text-center animate-pulse">Flipping...</p>}
    </div>
  )

  const renderResult = () => (
    <div className="flex flex-col items-center">
      <div className="perspective-container mb-6">
        <div className={`coin ${result === "heads" ? "heads-up" : "tails-up"}`}>
          {/* Heads side */}
          <div className="coin-side coin-heads">
            <Image
              src="/coin-heads.png"
              alt="Heads"
              width={150}
              height={150}
              className="rounded-full border border-muted-foreground/20 shadow-md"
            />
          </div>

          {/* Tails side */}
          <div className="coin-side coin-tails">
            <Image
              src="/coin-tails.png"
              alt="Tails"
              width={150}
              height={150}
              className="rounded-full border border-muted-foreground/20 shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold mb-1">Result: {result?.toUpperCase()}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-8 h-8 relative">
            <Image
              src={selectedTeam?.logo || "/placeholder.svg"}
              alt={selectedTeam?.name || ""}
              fill
              className="object-contain"
            />
          </div>
          <p className="font-medium">{selectedTeam?.name}</p>
          <Badge>{result === "heads" ? "Group B" : "Group A"}</Badge>
        </div>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="w-full">
      <Alert className="mb-4">
        <Check className="h-4 w-4" />
        <AlertDescription>All teams have been assigned to groups. Please review and confirm.</AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Group A</h3>
          <div className="space-y-2">
            {teams
              .filter((t) => t.group === "A")
              .map((team) => (
                <div key={team.id} className="flex items-center gap-2 p-2 bg-accent/50 rounded-md">
                  <div className="w-8 h-8 relative">
                    <Image src={team.logo || "/placeholder.svg"} alt={team.name} fill className="object-contain" />
                  </div>
                  <span className="text-sm">{team.name}</span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Group B</h3>
          <div className="space-y-2">
            {teams
              .filter((t) => t.group === "B")
              .map((team) => (
                <div key={team.id} className="flex items-center gap-2 p-2 bg-accent/50 rounded-md">
                  <div className="w-8 h-8 relative">
                    <Image src={team.logo || "/placeholder.svg"} alt={team.name} fill className="object-contain" />
                  </div>
                  <span className="text-sm">{team.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[450px] max-w-[90vw]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Team Assignment</CardTitle>
            <CardDescription>
              {step === "select" && "Select a team to assign to a group"}
              {step === "flip" && "Flipping coin to determine group"}
              {step === "result" && `${selectedTeam?.name} assigned to Group ${selectedTeam?.group}`}
              {step === "confirm" && "Review and confirm group assignments"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
          {step === "select" && renderTeamSelection()}
          {step === "flip" && renderCoinFlip()}
          {step === "result" && renderResult()}
          {step === "confirm" && renderConfirmation()}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          {step === "select" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={flipCoin} disabled={!selectedTeam || (groupACounts >= 5 && groupBCounts >= 5)}>
                Flip Coin
              </Button>
            </>
          )}

          {step === "result" && (
            <>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={resetSelection}>
                Assign Next Team
              </Button>
            </>
          )}

          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={resetSelection}>
                Back
              </Button>
              <Button onClick={confirmGroups}>Confirm Groups</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
