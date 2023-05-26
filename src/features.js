import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew'
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory'
import MoodIcon from '@material-ui/icons/Mood'
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun'
import TuneIcon from '@material-ui/icons/Tune'
import WcIcon from '@material-ui/icons/Wc'
import LiveTvIcon from '@material-ui/icons/LiveTv'
import ControlCameraIcon from '@material-ui/icons/ControlCamera'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as BlenderIcon } from './assets/images/icons/blender.svg'
import { ReactComponent as SubstancePainterIcon } from './assets/images/icons/substance-painter.svg'
import { ReactComponent as OculusIcon } from './assets/images/icons/oculus.svg'
import { ReactComponent as ChilloutVRIcon } from './assets/images/icons/chilloutvr.svg'
import { ReactComponent as PhotoshopIcon } from './assets/images/icons/photoshop.svg'
import { ReactComponent as NeosVRIcon } from './assets/images/icons/neosvr.svg'

export const featureMeta = {
  noPublicAvatars: {
    label: 'Public Avatars Banned',
    tags: ['public_avatars_banned'],
    icon: ClearIcon,
    isBad: true,
    tip:
      'The creator of this avatar has explicitly banned uploading public versions of this avatar. This is overly restrictive.'
  },
  free: {
    label: 'Free',
    tags: ['free'],
    icon: AttachMoneyIcon
  },
  rigged: {
    label: 'Rigged',
    tags: ['rigged', 'dynamic_bones_ready', 'full_body_ready'],
    icon: AccessibilityNewIcon
  },
  lowPoly: {
    label: 'Low Poly',
    tags: ['low_poly'],
    icon: ChangeHistoryIcon
  },
  questCompatible: {
    label: 'Quest Compatible',
    tags: ['quest_compatible'],
    icon: OculusIcon
  },
  blendshapes: {
    label: 'Multiple Blendshapes',
    tags: ['multiple_blend_shapes', 'customizable_body'],
    icon: TuneIcon
  },
  substancePainterIncluded: {
    label: 'Blender File',
    tags: ['blendfile_included'],
    icon: BlenderIcon
  },
  substancePainterIncluded: {
    label: 'Substance Painter File',
    tags: ['substance_painter_included'],
    icon: SubstancePainterIcon
  },
  psdIncluded: {
    label: 'Photoshop File',
    tags: ['psd_included'],
    icon: PhotoshopIcon
  },
  customAnimations: {
    label: 'Custom Gestures',
    tags: ['custom_gestures'],
    icon: MoodIcon
  },
  customAnimations: {
    label: 'Custom Animations',
    tags: ['custom_animations', 'custom_idle_animation', 'custom_emotes'],
    icon: DirectionsRunIcon
  },
  puppets: {
    label: 'Body Puppets',
    tags: ['body_puppets'],
    icon: ControlCameraIcon
  },
  multipleGenders: {
    label: 'Female Variant',
    tags: ['female_blend_shapes'],
    icon: WcIcon
  },
  vrm: {
    label: 'VRM Ready',
    tags: ['vrm_ready'],
    icon: LiveTvIcon
  },
  chilloutvr: {
    label: 'ChilloutVR Ready',
    tags: ['chilloutvr_ready', 'chilloutvr_tested'],
    icon: ChilloutVRIcon
  },
  neosvr: {
    label: 'NeosVR Ready',
    tags: ['neosvr_ready', 'neosvr_tested'],
    icon: NeosVRIcon
  }
}
