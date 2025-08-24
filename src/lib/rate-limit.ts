import rateLimit from 'express-rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  skipSuccessfulRequests?: boolean
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests', skipSuccessfulRequests = false } = options

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
    const now = Date.now()
    const key = `${ip}-${request.nextUrl.pathname}`
    
    const record = rateLimitMap.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return null
    }
    
    if (record.count >= max) {
      return NextResponse.json(
        { error: message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
          }
        }
      )
    }
    
    record.count++
    return null
  }
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later'
})

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // limit each IP to 10 requests per minute
})