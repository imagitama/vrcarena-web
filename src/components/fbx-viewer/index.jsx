import React, { useEffect, useRef } from 'react'
import * as THREE from 'three/build/three.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { WEBSITE_FULL_URL } from '../../config'

export default ({ url, onClick = null }) => {
  const containerRef = useRef()
  const requestIdRef = useRef()

  useEffect(() => {
    const container = containerRef.current
    var camera, scene, renderer, light, controls

    let containerWidth = container.offsetWidth
    let containerHeight = container.offsetHeight

    var clock = new THREE.Clock()

    var mixer

    init()
    animate()

    function init() {
      camera = new THREE.PerspectiveCamera(
        45,
        containerWidth / containerHeight,
        1,
        10000
      )
      camera.position.set(100, 200, 300)

      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xa0a0a0)
      // scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000)

      light = new THREE.HemisphereLight(0xffffff, 0x444444)
      light.position.set(0, 200, 0)
      scene.add(light)

      light = new THREE.DirectionalLight(0xffffff)
      light.position.set(0, 200, 100)
      light.castShadow = true
      light.shadow.camera.top = 180
      light.shadow.camera.bottom = -100
      light.shadow.camera.left = -120
      light.shadow.camera.right = 120
      scene.add(light)

      // scene.add( new CameraHelper( light.shadow.camera ) );

      // ground
      // var mesh = new THREE.Mesh(
      //   new THREE.PlaneBufferGeometry(2000, 2000),
      //   new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
      // )
      // mesh.rotation.x = -Math.PI / 2
      // mesh.receiveShadow = true
      // scene.add(mesh)

      var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000)
      grid.material.opacity = 0.2
      grid.material.transparent = true
      scene.add(grid)

      function fitCameraToObject(camera, controls, object, fitOffset = 1.2) {
        const box = new THREE.Box3()

        box.expandByObject(object)

        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const maxSize = Math.max(size.x, size.y, size.z)
        const fitHeightDistance =
          maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360))
        const fitWidthDistance = fitHeightDistance / camera.aspect
        const distance =
          fitOffset * Math.max(fitHeightDistance, fitWidthDistance)

        const direction = controls.target
          .clone()
          .sub(camera.position)
          .normalize()
          .multiplyScalar(distance)

        controls.maxDistance = distance * 10
        controls.target.copy(center)

        camera.near = distance / 100
        camera.far = distance * 100
        camera.updateProjectionMatrix()

        camera.position.copy(controls.target).sub(direction)

        controls.update()
      }

      // model
      var loader = new FBXLoader()
      loader.setRequestHeader({ Origin: WEBSITE_FULL_URL })
      loader.load(url, function(object) {
        object.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(object)

        fitCameraToObject(camera, controls, object)
      })

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(containerWidth, containerHeight)
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)

      renderer.domElement.addEventListener('click', () => {
        if (onClick) {
          onClick()
        }
      })

      controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 100, 0)
      controls.update()

      window.addEventListener('resize', onWindowResize, false)
    }

    function onWindowResize() {
      camera.aspect = containerWidth / containerHeight
      camera.updateProjectionMatrix()

      containerWidth = container.offsetWidth
      containerHeight = container.offsetHeight

      renderer.setSize(containerWidth, containerHeight)
    }

    function animate() {
      requestIdRef.current = requestAnimationFrame(animate)

      var delta = clock.getDelta()

      if (mixer) mixer.update(delta)

      renderer.render(scene, camera)
    }

    return () => {
      cancelAnimationFrame(requestIdRef.current)
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
}
