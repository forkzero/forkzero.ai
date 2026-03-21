#!/usr/bin/env node

import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const dir = join(process.cwd(), 'test-results')

let files
try {
  files = readdirSync(dir).filter((f) => f.endsWith('.xml'))
} catch {
  console.error('No test-results/ directory found.')
  process.exit(1)
}

if (files.length === 0) {
  console.error('No JUnit XML files found in test-results/.')
  process.exit(1)
}

const suites = []

for (const file of files.sort()) {
  const xml = readFileSync(join(dir, file), 'utf8')
  const name = basename(file, '.xml')

  // Aggregate all <testsuite> elements in the file
  let tests = 0
  let failures = 0
  let skipped = 0
  let time = 0

  const suiteRegex = /<testsuite\s[^>]*>/g
  let match
  while ((match = suiteRegex.exec(xml)) !== null) {
    const tag = match[0]
    const attr = (key) => {
      const m = tag.match(new RegExp(`${key}="([^"]*)"`, ''))
      return m ? m[1] : '0'
    }
    tests += parseInt(attr('tests'), 10)
    failures += parseInt(attr('failures'), 10) + parseInt(attr('errors'), 10)
    skipped += parseInt(attr('skipped'), 10)
    time += parseFloat(attr('time'))
  }

  const passed = tests - failures - skipped
  suites.push({ name, tests, passed, failures, skipped, time })
}

// Totals
let totalTests = 0
let totalPass = 0
let totalFail = 0
let totalSkip = 0
let totalTime = 0
for (const s of suites) {
  totalTests += s.tests
  totalPass += s.passed
  totalFail += s.failures
  totalSkip += s.skipped
  totalTime += s.time
}

const md = process.argv.includes('--md')

if (md) {
  const status = totalFail > 0 ? 'FAIL' : 'PASS'
  console.log(`### ${status} — Test Summary`)
  console.log()
  console.log('| Suite | Tests | Pass | Fail | Skip | Time |')
  console.log('|-------|------:|-----:|-----:|-----:|-----:|')
  for (const s of suites) {
    console.log(`| ${s.name} | ${s.tests} | ${s.passed} | ${s.failures} | ${s.skipped} | ${s.time.toFixed(1)}s |`)
  }
  console.log(`| **Total** | **${totalTests}** | **${totalPass}** | **${totalFail}** | **${totalSkip}** | **${totalTime.toFixed(1)}s** |`)
} else {
  const col = { name: 16, num: 6, time: 7 }
  const pad = (s, w) => String(s).padStart(w)
  const padName = (s, w) => String(s).padEnd(w)
  const row = (n, t, p, f, sk, tm) =>
    `${padName(n, col.name)} ${pad(t, col.num)} ${pad(p, col.num)} ${pad(f, col.num)} ${pad(sk, col.num)} ${pad(tm, col.time)}`

  const rule = '─'.repeat(col.name + 1 + (col.num + 1) * 4 + col.time)
  console.log()
  console.log(row('Suite', 'Tests', 'Pass', 'Fail', 'Skip', 'Time'))
  console.log(rule)
  for (const s of suites) {
    console.log(row(s.name, s.tests, s.passed, s.failures, s.skipped, s.time.toFixed(1) + 's'))
  }
  console.log(rule)
  console.log(row('Total', totalTests, totalPass, totalFail, totalSkip, totalTime.toFixed(1) + 's'))
  console.log()
}

if (totalFail > 0) {
  process.exit(1)
}
