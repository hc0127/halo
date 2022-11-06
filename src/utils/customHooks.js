import { useState, useEffect, useRef } from 'react'
import Parse from 'parse'

// functions copied from https://codesandbox.io/s/qxnmn1n45q

const useAnimationTimer = (duration = 1000, delay = 0) => {
  const [elapsed, setTime] = useState(0)

  useEffect(
    () => {
      let animationFrame
      let timerStop
      let start

      // animation loop
      const loop = () => {
        animationFrame = requestAnimationFrame(() => {
          setTime(Date.now() - start)
          loop()
        })
      }

      const onStart = () => {
        // Set a timeout to stop things when duration time elapses
        timerStop = setTimeout(() => {
          cancelAnimationFrame(animationFrame)
          setTime(Date.now() - start)
        }, duration)

        // Start the loop
        start = Date.now()
        loop()
      }

      // Start after specified delay (defaults to 0)
      const timerDelay = setTimeout(onStart, delay)

      // Clean things up
      return () => {
        clearTimeout(timerStop)
        clearTimeout(timerDelay)
        cancelAnimationFrame(animationFrame)
      }
    },
    [duration, delay], // Only re-run effect if duration or delay changes
  )

  return elapsed
}

const useAnimation = (easing, duration = 500, delay = 0) => {
  // The useAnimationTimer hook calls useState every animation frame ...
  // ... giving us elapsed time and causing a rerender as frequently ...
  // ... as possible for a smooth animation.
  const elapsed = useAnimationTimer(duration, delay)
  // Amount of specified duration elapsed on a scale from 0 - 1
  const n = Math.min(1, elapsed / duration)
  // Return altered value based on our specified easing function
  return easing(n)
}

// Some easing functions copied from:
// https://github.com/streamich/ts-easing/blob/master/src/index.ts
// Hardcode here or pull in a dependency
const easing = {
  linear: n => n,
  elastic: n =>
    n * (33 * n * n * n * n - 106 * n * n * n + 126 * n * n - 67 * n + 15),
  inExpo: n => 2 ** (10 * (n - 1)),
  outExpo: t => -(2 ** (-10 * t)) + 1,
}

const useInterval = (callback, delay) => {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return undefined
  }, [delay])
}

const useParseFetch = (obj, requiredField) => {
  const [parseObject, setParseObject] = useState(null)

  useEffect(() => {
    const fetchIncidentIfNeeded = async () => {
      if (!obj || !obj.has) {
        // either the object is null, or it's not a parse object, so ignore this
      } else if (!obj.has(requiredField)) {
        const newObj = await obj.fetch()
        setParseObject(newObj)
      } else {
        setParseObject(obj)
      }
    }

    fetchIncidentIfNeeded()
    return () => {}
  }, [obj, requiredField])

  return parseObject
}

const useIsBottomScrolled = loading => {
  const containerRef = useRef(null)
  const [isBottom, setIsBottom] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const { offsetHeight, scrollHeight, scrollTop } = containerRef.current
      const visible =
        offsetHeight !== scrollHeight &&
        scrollTop + offsetHeight !== scrollHeight
      setIsBottom(visible)
    }

    const { current } = containerRef

    current.addEventListener('scroll', onScroll)
    onScroll()
    return () => {
      current.removeEventListener('scroll', onScroll)
    }
  }, [loading])

  return [isBottom, containerRef]
}

const useFileInputDataValue = value => {
  const [data, setData] = useState(null)

  useEffect(() => {
    let objectUrl

    if (!value) {
      setData(null)
    } else if (value instanceof File) {
      objectUrl = URL.createObjectURL(value)
      setData(objectUrl)
    } else if (value instanceof Parse.File) {
      if (value.url()) {
        setData(value.url())
      } else if (value._source.file) {
        objectUrl = URL.createObjectURL(value._source.file)
        setData(objectUrl)
      }
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [value])

  return data
}

export {
  useAnimation,
  easing,
  useInterval,
  useParseFetch,
  useIsBottomScrolled,
  useFileInputDataValue,
}
