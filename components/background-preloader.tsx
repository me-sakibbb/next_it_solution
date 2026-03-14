'use client'

import { useEffect } from 'react'

export function BackgroundPreloader() {
    useEffect(() => {
        const warmUp = async () => {
            try {
                // We import it dynamically to avoid bloating the main site bundle
                const { preload } = await import('@imgly/background-removal')

                // Check for WebGPU support to choose the right model
                const hasWebGPU = 'gpu' in navigator

                await preload({
                    model: hasWebGPU ? 'isnet_fp16' : 'isnet_quint8',
                    device: hasWebGPU ? 'gpu' : 'cpu',
                    proxyToWorker: true,
                    // Same path used in the photo editor
                    publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
                })
                console.log('AI models pre-loaded successfully')
            } catch (error) {
                // Silently fail, it's just an optimization
                console.debug('Background pre-load skipped or failed:', error)
            }
        }

        // Delay warmup slightly so it doesn't compete with the main page load resources
        const timeout = setTimeout(warmUp, 2000)
        return () => clearTimeout(timeout)
    }, [])

    return null
}
