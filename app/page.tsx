"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CoinsIcon, Moon, Sun, Trophy, Users } from "lucide-react"
import { useTheme } from "next-themes"
import CoinToss from "@/components/coin-toss"
import axios from 'axios';

interface Team {
  id: number
  name: string
  logo: string
  group?: "A" | "B" | null
}

interface TeamStanding {
  id: number
  rank: number
  name: string
  logo: string
  played: number
  won: number
  lost: number
  points: number
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showCoinToss, setShowCoinToss] = useState(false)

  // State for team standings
  const [groupAStandings, setGroupAStandings] = useState<TeamStanding[]>([
    // { id: 1, rank: 1, name: "Birdies", logo: "/team-logos/Birdies.png", played: 6, won: 5, lost: 1, points: 10 },
    // { id: 2, rank: 2, name: "Red Dragon", logo: "/team-logos/Red Dragon.png", played: 6, won: 4, lost: 2, points: 8 },
    // { id: 3, rank: 3, name: "Sharks", logo: "/team-logos/Sharks.png", played: 6, won: 3, lost: 3, points: 6 },
    // { id: 4, rank: 4, name: "Exbolts", logo: "/team-logos/Exbolts.png", played: 6, won: 0, lost: 6, points: 0 },
  ])

  const [groupBStandings, setGroupBStandings] = useState<TeamStanding[]>([
    // { id: 5, rank: 1, name: "Power Boys", logo: "/team-logos/Power Boys.png", played: 6, won: 5, lost: 1, points: 10 },
    // { id: 6, rank: 2, name: "Racket Gun Mafia", logo: "/team-logos/RGM.png", played: 6, won: 3, lost: 3, points: 6 },
    // { id: 7, rank: 3, name: "Lambert's Smash", logo: "/team-logos/Lambert's Smash.png", played: 6, won: 2, lost: 4, points: 4 },
    // { id: 8, rank: 4, name: "DCSL Wolves", logo: "/team-logos/DCSL Wolves.png", played: 6, won: 2, lost: 4, points: 4 },
  ])



  const [data, setData] = useState<any>([])
  const fetchPoints = async () => {
    try {
      const response: any = await axios.get('https://api.brexe.com/sbplay/getAll')
      if (response.data.response === 'success') {
        let tempData: any = response.data.data;
        let datat: any = []
        tempData.map((item: any) => {
          datat.push({
            team: item.team_name,
            played: item.played,
            won: item.wins,
            lost: item.losts,
            group: item.group,
            logo: item.logo,
            id: item.id,
            qualified: item.qualified,
            matchesWin: item.games_win,
            matchesPlayed: item.matches_played,
            points: item.points * 2,
            winMatchRatio: (item.matches_played === 0 || item.games_win === 0) ? 0 : item.games_win / item.matches_played
          })
        })
        datat.sort((a: any, b: any) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return b.winMatchRatio - a.winMatchRatio;
        });

        datat = datat.map((item: any, index: number) => ({
          ...item,
          rank: index + 1,
        }));

        let tempAGroup: any = [];
        let tempBGroup: any = [];

        datat.map((item: any, index: number) => {
          if (item.group === 'A') {
            tempAGroup.push({
              id: item.id,
              rank: tempAGroup.length + 1,
              name: item.team,
              logo: item.logo,
              played: item.played,
              won: item.won,
              lost: item.lost,
              points: item.points
            })
          } else if (item.group === 'B') {
            tempBGroup.push({
              id: item.id,
              rank: tempBGroup.length + 1,
              name: item.team,
              logo: item.logo,
              played: item.played,
              won: item.won,
              lost: item.lost,
              points: item.points
            })
          }

        })
        setGroupAStandings(tempAGroup)
        setGroupBStandings(tempBGroup)
        // setData(datat)
      }
    } catch (error) {

    }
  }

  const [upcomingMatches, setUpcomingMatches] = useState<any>(null)
  const [recentResults, setRecentResults] = useState<any>(null)
  
  const fetchFixtures = async () => {
    try {
      const response: any = await axios.get('https://api.brexe.com/matches/getAll')
      if (response.data.response === 'success') {
        let tdata: any = [];
        let trdata: any = [];
        response.data.matches.map((item: any) => {
          if (!item.results) {
            tdata.push({
              id: item.match_no,
              team1: { name: item.team_1, logo: `/team-logos/${item.team_1 === 'Racket Gun Mafia' ? 'RGM' : item.team_1.startsWith("Lambert") ? "LsSmash" : item.team_1}.png` },
              team2: { name: item.team_2, logo: `/team-logos/${item.team_2 === 'Racket Gun Mafia' ? 'RGM' : item.team_2.startsWith("Lambert") ? "LsSmash" : item.team_2}.png` },
              date: item.date,
              time: item.time,
              tournament: item.match_no,
            })
          } else if (item.results) {
            let sets:any = [];
            const results = JSON.parse(item.results);

            results[0].points.map((point: any, index: number) => {
              sets.push({
                team1: point,
                team2: results[1].points[index] // matching index for team 2
              });
            });

            trdata.push({
              id: item.match_no,
              team1: { name: item.team_1, logo: `/team-logos/${item.team_1 === 'Racket Gun Mafia' ? 'RGM' : item.team_1.startsWith("Lambert") ? "LsSmash" : item.team_1}.png` },
              team2: { name: item.team_2, logo: `/team-logos/${item.team_2 === 'Racket Gun Mafia' ? 'RGM' : item.team_2.startsWith("Lambert") ? "LsSmash" : item.team_2}.png` },
              date: item.date,
              sets: sets,
              winner: item.team_1 === item.winner ?  1 : 2,
              tournament: item.match_no,
            })
          }
        })
        setUpcomingMatches(tdata.length > 0 ? tdata.slice().reverse() : null)
        setRecentResults(trdata.length > 0 ? trdata : null)
      }
    } catch (error) {

    }
  }

  // Ensure theme toggle only renders client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    fetchPoints()
    fetchFixtures()
  }, [])

  // Handle group confirmation
  const handleConfirmGroups = (groupA: Team[], groupB: Team[]) => {
    // Create new standings with 0 points for all teams
    const newGroupAStandings = groupA.map((team => {
      // Create new standings with 0 points for all teams
      const newGroupAStandings = groupA.map((team, index) => ({
        id: team.id,
        rank: index + 1,
        name: team.name,
        logo: team.logo,
        played: 0,
        won: 0,
        lost: 0,
        points: 0
      }))

      const newGroupBStandings = groupB.map((team, index) => ({
        id: team.id,
        rank: index + 1,
        name: team.name,
        logo: team.logo,
        played: 0,
        won: 0,
        lost: 0,
        points: 0
      }))

      // Update standings
      setGroupAStandings(newGroupAStandings)
      setGroupBStandings(newGroupBStandings)
    }
    ))
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 border-b">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[180px] h-[80px] relative flex items-center justify-start">
              <Image
                src={resolvedTheme === "light" ? "/logo.png" : "/dark_logo.png"}
                alt="Shuttle Royale Logo"
                width={140}
                height={80}
                className="object-contain object-left"
              />
            </div>
            {/* <h1 className="text-4xl md:text-5xl font-bold">SHUTTLE ROYALE</h1> */}
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <nav className="mr-4">
              <ul className="flex gap-6">
                <li className="hover:text-primary transition-colors">
                  <a href="#teams">Teams</a>
                </li>
                <li className="hover:text-primary transition-colors">
                  <a href="#standings">Standings</a>
                </li>
                {/* <li className="hover:text-primary transition-colors">
                  <a href="#bracket">Bracket</a>
                </li> */}
                <li className="hover:text-primary transition-colors">
                  <a href="#matches">Matches</a>
                </li>
              </ul>
            </nav>
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Animated Background */}
      <section className="relative py-16 overflow-hidden">
        <div className="hero-animated-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">SEASON 2</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">SHUTTLE ROYALE</h2>
            <p className="text-lg text-white/80 mb-8">
              Follow your favorite teams, track standings, and never miss a match in the most competitive badminton
              league.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Section - Auto-scrolling */}
      <section id="teams" className="py-12 border-y">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Users className="mr-2 h-8 w-8" />
            COMPETING TEAMS
          </h2>
          <div
            className="relative overflow-hidden py-4"
            style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
          >
            <div className="flex space-x-8 animate-marquee">
              {[...teams, ...teams].map((team, index) => (
                <div key={`${team.id}-${index}`} className="w-[180px] flex-shrink-0">
                  <div className="bg-card p-4 rounded-md flex flex-col items-center hover:bg-accent transition-colors">
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={team.name}
                      width={140}
                      height={140}
                      className="object-contain mb-4"
                    />
                    <h3 className="font-bold text-center">{team.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Standings Section - Group A and Group B */}
      <section id="standings" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Trophy className="mr-2 h-8 w-8" />
            CURRENT STANDINGS
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Group A */}
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Group A</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Team</th>
                        <th className="p-4">P</th>
                        <th className="p-4">W</th>
                        <th className="p-4">L</th>
                        <th className="p-4">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupAStandings.map((team) => (
                        <tr key={team.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">{team.rank}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Image
                                src={team.logo || "/placeholder.svg"}
                                alt={team.name}
                                width={30}
                                height={30}
                                className="object-contain"
                              />
                              {team.name}
                            </div>
                          </td>
                          <td className="p-4">{team.played}</td>
                          <td className="p-4">{team.won}</td>
                          <td className="p-4">{team.lost}</td>
                          <td className="p-4 font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Group B */}
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Group B</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Team</th>
                        <th className="p-4">P</th>
                        <th className="p-4">W</th>
                        <th className="p-4">L</th>
                        <th className="p-4">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupBStandings.map((team) => (
                        <tr key={team.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">{team.rank}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Image
                                src={team.logo || "/placeholder.svg"}
                                alt={team.name}
                                width={30}
                                height={30}
                                className="object-contain"
                              />
                              {team.name}
                            </div>
                          </td>
                          <td className="p-4">{team.played}</td>
                          <td className="p-4">{team.won}</td>
                          <td className="p-4">{team.lost}</td>
                          <td className="p-4 font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Matches Section */}
      <section id="matches" className="py-12 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <CalendarDays className="mr-2 h-8 w-8" />
            MATCHES
          </h2>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upcoming">Upcoming Fixtures</TabsTrigger>
              <TabsTrigger value="results">Recent Results</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingMatches?.map((match: any) => (
                  <Card key={match.id}>
                    <CardHeader className="bg-muted/50 py-2 px-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Match {match.tournament}</Badge>
                        <span className="text-sm">{match.date}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center text-center w-2/5">
                          <Image
                            src={match.team1.logo || "/placeholder.svg"}
                            alt={match.team1.name}
                            width={60}
                            height={60}
                            className="object-contain mb-2"
                          />
                          <span className="font-bold text-xs">{match.team1.name}</span>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">VS</div>
                          <div className="text-sm mt-1">{match.time}</div>
                        </div>
                        <div className="flex flex-col items-center text-center w-2/5">
                          <Image
                            src={match.team2.logo || "/placeholder.svg"}
                            alt={match.team2.name}
                            width={60}
                            height={60}
                            className="object-contain mb-2"
                          />
                          <span className="font-bold text-xs">{match.team2.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="results">
              <div className="grid gap-4 md:grid-cols-2">
                {recentResults?.map((match: any) => (
                  <Card
                    key={match.id}
                    className={
                      match.winner === 1
                        ? "border-l-4 border-l-primary"
                        : match.winner === 2
                          ? "border-r-4 border-r-primary"
                          : ""
                    }
                  >
                    <CardHeader className="bg-muted/50 py-2 px-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Match {match.tournament}</Badge>
                        <span className="text-sm">{match.date}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex flex-col items-center text-center w-2/5 ${match.winner === 1 ? "bg-primary/10 rounded-lg p-2" : ""}`}
                        >
                          <Image
                            src={match.team1.logo || "/placeholder.svg"}
                            alt={match.team1.name}
                            width={80}
                            height={80}
                            className="object-contain mb-2"
                          />
                          <span className="font-bold text-xs">{match.team1.name}</span>
                          <div className="mt-2">
                            {match.sets.map((set: any, index: number) => (
                              <span
                                key={index}
                                className={`inline-block px-2 py-1 text-sm font-mono rounded mx-1 ${set.team1 > set.team2 ? "bg-primary/20 font-bold" : "bg-muted"
                                  }`}
                              >
                                {set.team1}
                              </span>
                            ))}
                          </div>
                          {match.winner === 1 && (
                            <Badge className="mt-2 bg-primary">Winner</Badge>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">VS</div>
                        </div>
                        <div
                          className={`flex flex-col items-center text-center w-2/5 ${match.winner === 2 ? "bg-primary/10 rounded-lg p-2" : ""}`}
                        >
                          <Image
                            src={match.team2.logo || "/placeholder.svg"}
                            alt={match.team2.name}
                            width={80}
                            height={80}
                            className="object-contain mb-2"
                          />
                          <span className="font-bold text-xs">{match.team2.name}</span>
                          <div className="mt-2">
                            {match.sets.map((set: any, index: number) => (
                              <span
                                key={index}
                                className={`inline-block px-2 py-1 text-sm font-mono rounded mx-1 ${set.team2 > set.team1 ? "bg-primary/20 font-bold" : "bg-muted"
                                  }`}
                              >
                                {set.team2}
                              </span>
                            ))}
                          </div>
                          {match.winner === 2 && <Badge className="mt-2 bg-primary">Winner</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 SmashBros. All rights reserved.</p>
        </div>
      </footer>

      {/* Coin Toss Button */}
      {/* <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setShowCoinToss(true)}>
          <CoinsIcon className="h-6 w-6" />
        </Button>
      </div> */}

      {/* Coin Toss Modal */}
      {showCoinToss && <CoinToss onClose={() => setShowCoinToss(false)} onConfirmGroups={handleConfirmGroups} />}
    </div>
  )
}

// Data
const teams = [
  { id: 1, name: "Sharks", logo: "/team-logos/Sharks.png" },
  { id: 2, name: "Birdies", logo: "/team-logos/Birdies.png" },
  { id: 3, name: "Lambert's Smash", logo: "/team-logos/Lambert's Smash.png" },
  { id: 4, name: "Exbolts", logo: "/team-logos/Exbolts.png" },
  { id: 5, name: "Red Dragon", logo: "/team-logos/Red Dragon.png" },
  { id: 6, name: "Power Boys", logo: "/team-logos/Power Boys.png" },
  { id: 7, name: "Racket Gun Mafia", logo: "/team-logos/RGM.png" },
  { id: 8, name: "DCSL Wolves", logo: "/team-logos/DCSL Wolves.png" },
  { id: 9, name: "Kitchen Masters", logo: "/team-logos/Kitchen Masters.png" },
  { id: 10, name: "PKK", logo: "/team-logos/PKK.png" },
]



// const recentResults: any = [
//   // {
//   //   id: 1,
//   //   team1: { name: "Birdies", logo: "/team-logos/Birdies.png" },
//   //   team2: { name: "Lambert's Smash", logo: "/team-logos/Lambert's Smash.png" },
//   //   date: "April 28, 2025",
//   //   sets: [
//   //     { team1: 21, team2: 15 },
//   //     { team1: 21, team2: 18 },
//   //   ],
//   //   winner: 1,
//   //   tournament: "Group A vs B",
//   // },
//   // {
//   //   id: 2,
//   //   team1: { name: "Red Dragon", logo: "/team-logos/Red Dragon.png" },
//   //   team2: { name: "DCSL Wolves", logo: "/team-logos/DCSL Wolves.png" },
//   //   date: "April 27, 2025",
//   //   sets: [
//   //     { team1: 21, team2: 18 },
//   //     { team1: 19, team2: 21 },
//   //     { team1: 21, team2: 15 },
//   //   ],
//   //   winner: 1,
//   //   tournament: "Group A vs B",
//   // },
//   // {
//   //   id: 3,
//   //   team1: { name: "Sharks", logo: "/team-logos/Sharks.png" },
//   //   team2: { name: "Racket Gun Mafia", logo: "/team-logos/RGM.png" },
//   //   date: "April 26, 2025",
//   //   sets: [
//   //     { team1: 19, team2: 21 },
//   //     { team1: 21, team2: 19 },
//   //     { team1: 18, team2: 21 },
//   //   ],
//   //   winner: 2,
//   //   tournament: "Group A vs B",
//   // },
//   // {
//   //   id: 4,
//   //   team1: { name: "Exbolts", logo: "/team-logos/Exbolts.png" },
//   //   team2: { name: "Power Boys", logo: "/team-logos/Power Boys.png" },
//   //   date: "April 25, 2025",
//   //   sets: [
//   //     { team1: 15, team2: 21 },
//   //     { team1: 18, team2: 21 },
//   //   ],
//   //   winner: 2,
//   //   tournament: "Group A vs B",
//   // },
// ]
