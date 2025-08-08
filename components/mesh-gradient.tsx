'use client'

import { MeshGradient, type MeshGradientProps } from '@paper-design/shaders-react'

export function MeshGradientComponent({ speed, ...props }: MeshGradientProps) {
  return <MeshGradient {...props} speed={speed ? speed / 10 : 0.25} />
}

export default MeshGradientComponent
