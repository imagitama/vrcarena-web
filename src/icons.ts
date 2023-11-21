import React from 'react'

/** WARNING: The named exports of this file correspond to the "icon" column in tags table */

export const AttachMoney = React.lazy(() => import('@material-ui/icons/AttachMoney')) // paid
export const MoneyOff = React.lazy(() => import('@material-ui/icons/MoneyOff')) // free
export const Accessibility = React.lazy(() => import('@material-ui/icons/Accessibility')) // T-posing FBT
export const Brush = React.lazy(() => import('@material-ui/icons/Brush')) // textures
export const Loyalty = React.lazy(() => import('@material-ui/icons/Loyalty')) // NSFW
export const Visibility = React.lazy(() => import('@material-ui/icons/Visibility')) // eye textures / tracking / etc

export const Copy = React.lazy(() => import('@emotion-icons/entypo/Copy').then(result => ({ default: result.Copy }))) // prefabs
export const Bone = React.lazy(() => import('@emotion-icons/boxicons-solid/Bone').then(result => ({ default: result.Bone }))) // rigged/physbones
export const HappyFace = React.lazy(() => import('@emotion-icons/material/TagFaces').then(result => ({ default: result.TagFaces }))) // custom gestures
export const Map = React.lazy(() => import('@emotion-icons/bootstrap/Map').then(result => ({ default: result.Map }))) // uvmapped
export const FemaleSign = React.lazy(() => import('@emotion-icons/boxicons-regular/FemaleSign').then(result => ({ default: result.FemaleSign })))
export const MaleSign = React.lazy(() => import('@emotion-icons/boxicons-regular/MaleSign').then(result => ({ default: result.MaleSign })))

export const SubstancePainter = React.lazy(() => import('./assets/images/icons/substancepainter.svg').then(result => ({ default: result.ReactComponent })))
export const Blender = React.lazy(() => import('./assets/images/icons/blender.svg').then(result => ({ default: result.ReactComponent })))
export const Booth = React.lazy(() => import('./assets/images/icons/booth.svg').then(result => ({ default: result.ReactComponent })))
export const ChilloutVR = React.lazy(() => import('./assets/images/icons/chilloutvr.svg').then(result => ({ default: result.ReactComponent })))
export const Discord = React.lazy(() => import('./assets/images/icons/discord.svg').then(result => ({ default: result.ReactComponent })))
export const FileFbx = React.lazy(() => import('./assets/images/icons/file_fbx.svg').then(result => ({ default: result.ReactComponent })))
export const Gumroad = React.lazy(() => import('./assets/images/icons/gumroad.svg').then(result => ({ default: result.ReactComponent })))
export const NeosVR = React.lazy(() => import('./assets/images/icons/neosvr.svg').then(result => ({ default: result.ReactComponent })))
export const Oculus = React.lazy(() => import('./assets/images/icons/oculus.svg').then(result => ({ default: result.ReactComponent })))
export const Patreon = React.lazy(() => import('./assets/images/icons/patreon.svg').then(result => ({ default: result.ReactComponent })))
export const Photoshop = React.lazy(() => import('./assets/images/icons/photoshop.svg').then(result => ({ default: result.ReactComponent })))
export const Poiyomi = React.lazy(() => import('./assets/images/icons/poiyomi.svg').then(result => ({ default: result.ReactComponent })))
export const Twitch = React.lazy(() => import('./assets/images/icons/twitch.svg').then(result => ({ default: result.ReactComponent })))
export const Unity = React.lazy(() => import('./assets/images/icons/unity.svg').then(result => ({ default: result.ReactComponent })))
export const VRChat = React.lazy(() => import('./assets/images/icons/vrchat.svg').then(result => ({ default: result.ReactComponent })))
export const VRCFury = React.lazy(() => import('./assets/images/icons/vrcfury.svg').then(result => ({ default: result.ReactComponent })))
