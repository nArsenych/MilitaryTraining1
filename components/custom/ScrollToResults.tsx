"use client"

import { useEffect } from "react"

const ScrollToResults = () => {
  useEffect(() => {
    const el = document.getElementById("results")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }, [])
  return null
}

export default ScrollToResults
