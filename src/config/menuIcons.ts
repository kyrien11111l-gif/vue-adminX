import {
  Aim,
  Avatar,
  DataAnalysis,
  DataBoard,
  Document,
  Files,
  FullScreen,
  Folder,
  FolderOpened,
  Key,
  Link,
  List,
  Lock,
  Monitor,
  Operation,
  Odometer,
  Search,
  Setting,
  Tickets,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

const menuIcons: Record<string, Component> = {
  Aim,
  Avatar,
  DataAnalysis,
  DataBoard,
  Document,
  Files,
  FullScreen,
  Folder,
  FolderOpened,
  Key,
  Link,
  List,
  Lock,
  Monitor,
  Operation,
  Odometer,
  Search,
  Setting,
  Tickets,
  User,
  UserFilled
}

export function resolveMenuIcon(name?: string): Component {
  return (name && menuIcons[name]) || Document
}
