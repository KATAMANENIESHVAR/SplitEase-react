import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Check, CircleHelp, CreditCard,
  LayoutDashboard, LogOut, Plus, ReceiptText, Settings, ShieldCheck, Trash2,
  Users, WalletCards, X,
} from 'lucide-react'

const makePerson = (id, name, email) => ({ id, name, email, initials: name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), color: ['av-lilac', 'av-peach', 'av-blue', 'av-green'][name.length % 4] })
const initialState = user => {
  try {
    const saved = JSON.parse(localStorage.getItem(`splitease-react-state:${user.id}`))
    return saved || { user, groups: [], people: [makePerson(user.id, user.name, user.email)], expenses: [] }
  } catch { return { user, groups: [], people: [makePerson(user.id, user.name, user.email)], expenses: [] } }
}

const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount || 0))
const personName = (people, id) => people.find(person => person.id === id)?.name || 'Unknown'
const relativeDate = value => {
  const days = Math.round((new Date(`${value}T00:00:00`) - new Date(new Date().toDateString())) / 86400000)
  if (days === 0) return 'Today'
  if (days === -1) return 'Yesterday'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ person, size = '' }) {
  return <span className={`avatar ${person?.color || 'av-lilac'} ${size}`}>{person?.initials || '??'}</span>
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    setError('')
    const users = JSON.parse(localStorage.getItem('splitease-react-users') || '[]')
    const normalizedEmail = email.trim().toLowerCase()
    if (mode === 'register') {
      if (!name.trim()) return setError('Enter your name to create an account.')
      if (users.some(item => item.email === normalizedEmail)) return setError('An account with this email already exists. Please log in.')
      const user = { ...makePerson(crypto.randomUUID(), name.trim(), normalizedEmail), password }
      localStorage.setItem('splitease-react-users', JSON.stringify([...users, user]))
      onAuth(user)
      return
    }
    const user = users.find(item => item.email === normalizedEmail && item.password === password)
    if (!user) return setError('Email or password is incorrect. If you are new, create an account first.')
    onAuth(user)
  }
  return <main className="auth-screen">
    <nav className="auth-nav">
      <button className="brand auth-brand" onClick={() => setMode('login')}><span className="brand-mark"><span /><span /><span /><span /></span><span>SPLIT<span className="brand-light">EASE</span></span></button>
      <span>Shared expenses, made simple.</span>
    </nav>
    <div className="auth-layout">
      <section className="auth-story">
        <span className="auth-orbit orbit-one" /><span className="auth-orbit orbit-two" />
        <div className="auth-story-copy"><div className="auth-story-label"><span />LESS SETTLING. MORE LIVING.</div><h1>Good times<br />shouldn’t come<br /><em>with math.</em></h1><p>Keep every shared expense clear, fair, and easy to settle.</p><div className="auth-perks"><span><Check size={15} /> Split any way you like</span><span><Check size={15} /> Know where everyone stands</span></div></div>
        <div className="auth-visual" aria-hidden="true"><div className="visual-halo" /><div className="visual-card"><div className="visual-card-top"><span className="visual-icon"><ReceiptText size={17} /></span><span>JUST ADDED</span><span className="visual-check"><Check size={14} /></span></div><strong>Weekend dinner</strong><small>Shared with your group</small><div className="visual-divider" /><div className="visual-total"><span>Total</span><strong>₹2,400</strong></div><div className="visual-split"><span><i className="visual-dot dot-purple" />Individual shares</span><b>₹800 each</b></div><div className="visual-bars"><i /><i /><i /></div></div><div className="floating-note note-top"><span>✦</span> everyone’s in</div><div className="floating-note note-bottom"><span>✓</span> all adds up</div><span className="visual-spark spark-one">✳</span><span className="visual-spark spark-two">✦</span></div>
        <div className="auth-story-footer"><span>MADE FOR THE PLANS YOU’LL REMEMBER</span><span>01 — 03</span></div>
      </section>
      <section className="auth-card"><div className="auth-card-decoration">✳</div><div className="auth-mark">{mode === 'login' ? 'YOUR GROUP IS HERE' : 'A FRESH START'}</div><h2>{mode === 'login' ? 'Welcome back.' : 'Come on in.'}</h2><p className="auth-description">{mode === 'login' ? 'Pick up where your group left off.' : 'Create an account and bring your people together.'}</p><form onSubmit={submit}>{mode === 'register' && <label className="auth-field">Full name<input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" required /></label>}<label className="auth-field">Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="auth-field">Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="6" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" required /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-button auth-submit" type="submit">{mode === 'login' ? 'Login' : 'Create account'}<span>→</span></button></form><p className="auth-toggle">{mode === 'login' ? 'New to SplitEase?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Login'}</button></p><div className="auth-local-note"><ShieldCheck size={15} /> Prototype login is stored in this browser only. It is not secure for real accounts.</div></section>
    </div>
  </main>
}

function App() {
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('splitease-react-current-user')
    try {
      const stored = JSON.parse(localStorage.getItem('splitease-react-users') || '[]').find(item => item.id === id)
      if (!stored) return null
      const { password, ...safeUser } = stored
      return safeUser
    } catch { return null }
  })
  function enter(nextUser) {
    localStorage.setItem('splitease-react-current-user', nextUser.id)
    const { password, ...safeUser } = nextUser
    setUser(safeUser)
  }
  function logout() {
    localStorage.removeItem('splitease-react-current-user')
    setUser(null)
  }
  function updateAccount(updated) {
    const users = JSON.parse(localStorage.getItem('splitease-react-users') || '[]')
    const current = users.find(item => item.id === updated.id)
    localStorage.setItem('splitease-react-users', JSON.stringify(users.map(item => item.id === updated.id ? { ...current, ...updated } : item)))
    const { password, ...safeUser } = updated
    setUser(safeUser)
  }
  function changePassword(userId, currentPassword, nextPassword) {
    const users = JSON.parse(localStorage.getItem('splitease-react-users') || '[]')
    const account = users.find(item => item.id === userId)
    if (!account || account.password !== currentPassword) return false
    localStorage.setItem('splitease-react-users', JSON.stringify(users.map(item => item.id === userId ? { ...item, password: nextPassword } : item)))
    return true
  }
  return user ? <Workspace user={user} onLogout={logout} onUpdateUser={updateAccount} onChangePassword={changePassword} /> : <AuthScreen onAuth={enter} />
}

function Workspace({ user, onLogout, onUpdateUser, onChangePassword }) {
  const [data, setData] = useState(() => initialState(user))
  const [page, setPage] = useState('Overview')
  const [activeGroup, setActiveGroup] = useState('all')
  const [dialog, setDialog] = useState('')
  const [memberGroupId, setMemberGroupId] = useState('')
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => localStorage.setItem(`splitease-react-state:${user.id}`, JSON.stringify(data)), [data, user.id])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const balances = useMemo(() => {
    const result = Object.fromEntries(data.people.map(person => [person.id, 0]))
    data.expenses.forEach(expense => {
      result[expense.paidBy] = (result[expense.paidBy] || 0) + Number(expense.amount)
      expense.participants.forEach(id => {
        const share = expense.shares?.[id] ?? Number(expense.amount) / expense.participants.length
        result[id] = (result[id] || 0) - share
      })
    })
    return result
  }, [data.expenses, data.people])

  const visibleExpenses = useMemo(() => data.expenses
    .filter(expense => activeGroup === 'all' || expense.groupId === activeGroup)
    .filter(expense => `${expense.title} ${expense.category} ${personName(data.people, expense.paidBy)}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [data, activeGroup, query])

  const totalSpent = data.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const owedToMe = data.expenses.reduce((sum, expense) => {
    if (expense.paidBy !== data.user.id) return sum
    const myShare = expense.shares?.[data.user.id] ?? Number(expense.amount) / expense.participants.length
    return sum + Number(expense.amount) - myShare
  }, 0)
  const iOwe = data.expenses.reduce((sum, expense) => {
    if (expense.paidBy === data.user.id || !expense.participants.includes(data.user.id)) return sum
    return sum + (expense.shares?.[data.user.id] ?? Number(expense.amount) / expense.participants.length)
  }, 0)
  const currentGroup = data.groups.find(group => group.id === activeGroup)
  const nav = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Expenses', icon: ReceiptText },
    { label: 'Groups', icon: Users },
    { label: 'Balances', icon: WalletCards },
  ]

  function updateData(next) { setData(next) }
  function createGroup(groupName, newMembers) {
    const members = newMembers
    const addedPeople = members.filter(person => !data.people.some(existing => existing.id === person.id))
    const group = { id: crypto.randomUUID(), name: groupName, members: [...new Set([data.user.id, ...members.map(person => person.id)])], color: ['peach', 'lilac', 'mint'][data.groups.length % 3] }
    updateData({ ...data, people: [...data.people, ...addedPeople], groups: [group, ...data.groups] })
    setActiveGroup(group.id)
    setPage('Expenses')
    setToast('Your group is ready')
    setDialog('')
  }
  function createExpense(expense) {
    updateData({ ...data, expenses: [{ id: crypto.randomUUID(), ...expense }, ...data.expenses] })
    setToast('Expense added and shares updated')
    setDialog('')
  }
  function addMemberToGroup(groupId, person) {
    const group = data.groups.find(item => item.id === groupId)
    const existing = group?.members.map(id => data.people.find(item => item.id === id)).find(item => item?.name.toLowerCase() === person.name.toLowerCase())
    if (existing) {
      setToast('That person is already in this group')
      return
    }
    updateData({
      ...data,
      people: [...data.people, person],
      groups: data.groups.map(item => item.id === groupId ? { ...item, members: [...item.members, person.id] } : item),
    })
    setToast(`${person.name} added to the group`)
    setDialog('')
  }
  function deleteGroup(group) {
    if (!window.confirm(`Remove “${group.name}”? Its expense records will remain under All expenses.`)) return
    setData(current => ({
      ...current,
      groups: current.groups.filter(item => item.id !== group.id),
      expenses: current.expenses.map(expense => expense.groupId === group.id
        ? { ...expense, groupId: null, groupName: group.name }
        : expense),
    }))
    setActiveGroup(current => current === group.id ? 'all' : current)
    setToast(`${group.name} removed. Its expenses were kept.`)
  }
  function saveProfile(name, email) {
    const updatedUser = { ...user, name: name.trim(), email: email.trim().toLowerCase() }
    onUpdateUser(updatedUser)
    setData(current => ({
      ...current,
      user: updatedUser,
      people: current.people.map(person => person.id === user.id ? makePerson(user.id, updatedUser.name, updatedUser.email) : person),
    }))
    setToast('Profile settings saved')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('Overview')} aria-label="SplitEase home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>SPLIT<span className="brand-light">EASE</span></span>
        </button>
        <div className="side-label">WORKSPACE</div>
        <nav className="main-nav">
          {nav.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? 'selected' : ''}`} onClick={() => setPage(label)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Balances' && <span className="nav-dot" />}</button>)}
        </nav>
        <div className="groups-heading"><span className="side-label">YOUR GROUPS</span><button aria-label="Create a group" onClick={() => setDialog('group')}><Plus size={17} /></button></div>
        <div className="group-nav">
          {data.groups.map(group => <button key={group.id} className={`group-link ${activeGroup === group.id ? 'group-current' : ''}`} onClick={() => { setActiveGroup(group.id); setPage('Expenses') }}><span className={`group-dot ${group.color}`} /><span>{group.name}</span></button>)}
        </div>
        <div className="sidebar-bottom">
          <button className={`nav-item muted-item ${page === 'Settings' ? 'selected' : ''}`} onClick={() => setPage('Settings')}><Settings size={18} /><span>Settings</span></button>
          <div className="profile-mini"><Avatar person={data.people.find(person => person.id === data.user.id)} /><div className="profile-copy"><strong>{data.user.name}</strong><span>Personal account</span></div><button aria-label="Log out" onClick={onLogout}><LogOut size={16} /></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
          <div className="top-actions"><button className="help-button" onClick={() => setPage('Help')}><CircleHelp size={17} /><span>Help</span></button><span className="top-divider" /><button className="top-avatar" aria-label="Current account" onClick={() => setToast(data.user.email)}><Avatar person={data.people.find(person => person.id === data.user.id)} size="small" /></button></div>
        </header>

        <div className="page-content">
          {page === 'Overview' && <Overview data={data} totalSpent={totalSpent} owedToMe={owedToMe} iOwe={iOwe} balances={balances} setPage={setPage} setDialog={setDialog} setActiveGroup={setActiveGroup} />}
          {page === 'Expenses' && <Expenses data={data} visibleExpenses={visibleExpenses} activeGroup={activeGroup} currentGroup={currentGroup} setActiveGroup={setActiveGroup} setDialog={setDialog} query={query} setQuery={setQuery} />}
          {page === 'Groups' && <Groups data={data} setActiveGroup={setActiveGroup} setPage={setPage} setDialog={setDialog} setMemberGroupId={setMemberGroupId} onDeleteGroup={deleteGroup} />}
          {page === 'Balances' && <Balances data={data} balances={balances} />}
          {page === 'Settings' && <SettingsPage user={user} onSave={saveProfile} onLogout={onLogout} onChangePassword={onChangePassword} setPage={setPage} />}
          {page === 'Help' && <HelpPage setPage={setPage} />}
        </div>
      </main>

      {dialog === 'expense' && <ExpenseDialog data={data} initialGroup={activeGroup} onClose={() => setDialog('')} onSave={createExpense} />}
      {dialog === 'group' && <GroupDialog onClose={() => setDialog('')} onSave={createGroup} />}
      {dialog === 'members' && <MemberDialog group={data.groups.find(group => group.id === memberGroupId)} people={data.people} onClose={() => setDialog('')} onSave={person => addMemberToGroup(memberGroupId, person)} />}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

export default App

function Overview({ data, totalSpent, owedToMe, iOwe, balances, setPage, setDialog, setActiveGroup }) {
  const recent = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  return <>
    <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" />{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div><h1>A little more <em>together.</em></h1><p className="page-subtitle">Here’s what’s happening with your shared expenses.</p></div><button className="primary-button" onClick={() => setDialog('expense')}><Plus size={17} />Add an expense</button></div>
    <section className="summary-grid">
      <article className="summary-card spent-card"><div className="summary-top"><span>Total group spending</span><span className="metric-icon peach-icon"><CreditCard size={17} /></span></div><strong>{money(totalSpent)}</strong><div className="summary-foot"><span className="trend"><ArrowUpRight size={14} />12.8%</span><span>vs. last month</span></div><div className="spend-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
      <article className="summary-card"><div className="summary-top"><span>You are owed</span><span className="metric-icon green-icon"><ArrowDownLeft size={17} /></span></div><strong className="green-text">{money(owedToMe)}</strong><div className="summary-foot"><span className="soft-indicator green-indicator" />Across {data.groups.length} shared groups</div><div className="mini-people">{data.people.filter(person => person.id !== data.user.id).slice(0, 4).map(person => <Avatar key={person.id} person={person} size="tiny" />)}</div></article>
      <article className="summary-card"><div className="summary-top"><span>You owe</span><span className="metric-icon lilac-icon"><ArrowUpRight size={17} /></span></div><strong>{money(iOwe)}</strong><div className="summary-foot"><span className="soft-indicator lilac-indicator" />Across {data.groups.length} shared groups</div><div className="owe-progress"><span style={{ width: `${Math.min(100, iOwe ? 67 : 12)}%` }} /></div></article>
    </section>
    <section className="overview-grid">
      <div className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>The latest from your groups</p></div><button className="text-button" onClick={() => setPage('Expenses')}>View all <span>→</span></button></div><div className="activity-table"><div className="table-head"><span>EXPENSE</span><span>GROUP</span><span>PAID BY</span><span>AMOUNT</span><span>DATE</span></div>{recent.map(expense => <ExpenseRow key={expense.id} expense={expense} data={data} />)}</div></div>
      <div className="right-stack"><div className="panel groups-panel"><div className="panel-heading"><div><h2>Your groups</h2><p>{data.groups.length} active spaces</p></div><button className="icon-button" onClick={() => setDialog('group')} aria-label="Add group"><Plus size={17} /></button></div><div className="group-cards">{data.groups.slice(0, 3).map(group => { const spent = data.expenses.filter(expense => expense.groupId === group.id).reduce((sum, expense) => sum + expense.amount, 0); return <button className="group-card" key={group.id} onClick={() => { setActiveGroup(group.id); setPage('Expenses') }}><span className={`group-art ${group.color}`}><Users size={18} /></span><span className="group-card-main"><strong>{group.name}</strong><span>{group.members.length} members · {money(spent)} spent</span></span><span className="group-card-avatars">{group.members.slice(0, 3).map(id => <Avatar key={id} person={data.people.find(p => p.id === id)} size="tiny" />)}</span><span className="group-chevron">›</span></button> })}</div><button className="full-text-button" onClick={() => setPage('Groups')}>See all groups <span>→</span></button></div>
      <div className="tip-card"><span className="tip-symbol">✳</span><div><strong>Good things are shared.</strong><p>Little moments, big trips, and everything in between.</p></div><span className="tip-decoration">✳</span></div></div>
    </section>
  </>
}

function ExpenseRow({ expense, data, detailed = false }) {
  const payer = data.people.find(person => person.id === expense.paidBy)
  const group = data.groups.find(item => item.id === expense.groupId)
  const icon = expense.category === 'Transport' ? '↗' : expense.category === 'Home' ? '⌂' : expense.category === 'Groceries' ? '✳' : '◒'
  return <div className={`expense-row ${detailed ? 'detailed-row' : ''}`}><div className="expense-cell"><span className={`expense-icon ${group?.color || ''}`}>{icon}</span><span className="expense-title"><strong>{expense.title}</strong><small>{expense.category}</small></span></div><span className="group-cell"><i className={`group-dot ${group?.color || ''}`} />{group?.name || expense.groupName || 'Unknown group'}</span><span className="payer-cell"><Avatar person={payer} size="tiny" />{payer?.name.split(' ')[0]}</span><strong className="amount-cell">{money(expense.amount)}</strong><span className="date-cell">{relativeDate(expense.date)}</span>{detailed && <span className="share-cell">Your share <strong>{money(expense.shares?.[data.user.id] || 0)}</strong></span>}</div>
}

function Expenses({ data, visibleExpenses, activeGroup, currentGroup, setActiveGroup, setDialog, query, setQuery }) {
  return <><div className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />YOUR MONEY, IN GOOD COMPANY</div><h1>Every little <em>thing.</em></h1><p className="page-subtitle">One clear place for everything you share.</p></div><button className="primary-button" onClick={() => setDialog('expense')}><Plus size={17} />Add an expense</button></div>
    <div className="filter-bar"><div className="filter-tabs"><button className={activeGroup === 'all' ? 'filter-active' : ''} onClick={() => setActiveGroup('all')}>All expenses <span>{data.expenses.length}</span></button>{data.groups.map(group => <button key={group.id} className={activeGroup === group.id ? 'filter-active' : ''} onClick={() => setActiveGroup(group.id)}>{group.name}</button>)}</div><input className="search-input" placeholder="Find an expense..." value={query} onChange={event => setQuery(event.target.value)} /></div>
    <section className="panel expenses-panel"><div className="panel-heading"><div><h2>{currentGroup?.name || 'All expenses'}</h2><p>{visibleExpenses.length} entries · Shares are shown per person</p></div><button className="subtle-button" onClick={() => setDialog('expense')}><Plus size={16} />New expense</button></div><div className="activity-table"><div className="table-head"><span>EXPENSE</span><span>GROUP</span><span>PAID BY</span><span>AMOUNT</span><span>DATE</span><span>YOUR SHARE</span></div>{visibleExpenses.map(expense => <ExpenseRow key={expense.id} expense={expense} data={data} detailed />)}{!visibleExpenses.length && <div className="empty-state">Nothing here yet. Add an expense to get started.</div>}</div></section>
    <div className="privacy-note"><ShieldCheck size={17} /><span>Your data stays in this browser on this demo version.</span></div>
  </>
}

function Groups({ data, setActiveGroup, setPage, setDialog, setMemberGroupId, onDeleteGroup }) {
  return <><div className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />PEOPLE MAKE THE MOMENTS</div><h1>Your <em>groups.</em></h1><p className="page-subtitle">Create a group and add the people you want to split with.</p></div><button className="primary-button" onClick={() => setDialog('group')}><Plus size={17} />Create a group</button></div><div className="group-list-grid">{data.groups.map(group => { const expenses = data.expenses.filter(expense => expense.groupId === group.id); const total = expenses.reduce((sum, expense) => sum + expense.amount, 0); return <article className="group-large-card" key={group.id}><button className="group-card-open" onClick={() => { setActiveGroup(group.id); setPage('Expenses') }}><div className={`group-large-art ${group.color}`}><span><Users size={23} /></span><small>{group.members.length} PEOPLE</small></div><div className="group-large-body"><div className="group-large-title"><h2>{group.name}</h2><span>↗</span></div><p>{expenses.length} expenses · {money(total)} shared</p><div className="group-large-foot"><div className="avatar-stack">{group.members.map(id => <Avatar key={id} person={data.people.find(person => person.id === id)} size="small" />)}</div><span>{group.members.map(id => data.people.find(person => person.id === id)?.name.split(' ')[0]).join(', ')}</span></div></div></button><div className="group-card-actions"><button className="manage-members-button" onClick={() => { setMemberGroupId(group.id); setDialog('members') }}><Users size={14} />Manage members</button><button className="delete-group-button" onClick={() => onDeleteGroup(group)}><Trash2 size={14} />Delete group</button></div></article> })}{!data.groups.length && <div className="empty-state groups-empty">You haven’t created a group yet. Start one and add your members.</div>}</div></>
}

function Balances({ data, balances }) {
  return <><div className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />EVERYTHING ADDS UP</div><h1>All <em>square.</em></h1><p className="page-subtitle">A clear view of who’s owed and who owes.</p></div></div><section className="balance-grid">{data.people.map(person => { const value = balances[person.id] || 0; return <article className={`balance-card ${person.id === data.user.id ? 'my-balance' : ''}`} key={person.id}><div className="balance-person"><Avatar person={person} /><div><strong>{person.name}{person.id === data.user.id ? ' (you)' : ''}</strong><span>{person.id === data.user.id ? 'Your overall balance' : 'Shared with you'}</span></div></div><strong className={`balance-value ${value > 0 ? 'green-text' : ''}`}>{money(Math.abs(value))}</strong><span className={`balance-status ${value > 0 ? 'status-positive' : value < 0 ? 'status-negative' : ''}`}>{value > 0.005 ? 'gets back' : value < -0.005 ? 'owes overall' : 'all settled'}</span></article> })}</section><section className="panel balance-explain"><div className="metric-icon green-icon"><WalletCards size={18} /></div><div><h2>How balances work</h2><p>When someone pays, their balance goes up. Each participant’s individual share is deducted, so custom splits are reflected fairly.</p></div></section></>
}

function SettingsPage({ user, onSave, onLogout, onChangePassword, setPage }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [message, setMessage] = useState('')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  function submit(event) {
    event.preventDefault()
    setMessage('')
    const normalizedEmail = email.trim().toLowerCase()
    const users = JSON.parse(localStorage.getItem('splitease-react-users') || '[]')
    if (users.some(account => account.id !== user.id && account.email.toLowerCase() === normalizedEmail)) {
      setMessage('That email is already used by another account in this browser.')
      return
    }
    onSave(name, normalizedEmail)
  }
  function updatePassword(event) {
    event.preventDefault()
    setPasswordMessage('')
    if (passwords.next.length < 6) return setPasswordMessage('Choose a password with at least 6 characters.')
    if (passwords.next !== passwords.confirm) return setPasswordMessage('The new passwords do not match.')
    if (!onChangePassword(user.id, passwords.current, passwords.next)) return setPasswordMessage('Your current password is incorrect.')
    setPasswords({ current: '', next: '', confirm: '' })
    setPasswordMessage('Password changed successfully.')
  }
  return <>
    <div className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />YOUR ACCOUNT</div><h1>Settings &amp; <em>profile.</em></h1><p className="page-subtitle">Keep your account details up to date.</p></div></div>
    <div className="settings-grid">
      <section className="panel settings-panel"><div className="settings-section-heading"><div className="settings-avatar"><Avatar person={makePerson(user.id, name || user.name, email || user.email)} /></div><div><h2>Personal details</h2><p>These details appear in your groups.</p></div></div><form onSubmit={submit}><label className="field-label">FULL NAME<input value={name} onChange={event => setName(event.target.value)} required /></label><label className="field-label">LOGIN EMAIL<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>{message && <div className="auth-error">{message}</div>}<div className="settings-actions"><button className="primary-button" type="submit"><Check size={16} />Save changes</button></div></form></section>
      <div className="settings-side-stack"><section className="panel settings-panel password-panel"><div className="settings-section-heading"><div className="metric-icon lilac-icon"><ShieldCheck size={18} /></div><div><h2>Reset password</h2><p>Change your local account password.</p></div></div><form onSubmit={updatePassword}><label className="field-label">CURRENT PASSWORD<input type="password" autoComplete="current-password" value={passwords.current} onChange={event => setPasswords({ ...passwords, current: event.target.value })} required /></label><label className="field-label">NEW PASSWORD<input type="password" autoComplete="new-password" minLength="6" value={passwords.next} onChange={event => setPasswords({ ...passwords, next: event.target.value })} required /></label><label className="field-label">CONFIRM NEW PASSWORD<input type="password" autoComplete="new-password" minLength="6" value={passwords.confirm} onChange={event => setPasswords({ ...passwords, confirm: event.target.value })} required /></label>{passwordMessage && <div className={passwordMessage.includes('successfully') ? 'settings-success' : 'auth-error'}>{passwordMessage}</div>}<div className="settings-actions"><button className="primary-button" type="submit">Update password</button></div></form></section>
      <section className="panel settings-info"><div className="settings-info-heading"><div><h2>Need a hand?</h2><p>Browse tips for groups, expenses, and balances.</p></div><CircleHelp size={19} /></div><button className="settings-logout" onClick={() => setPage('Help')}>Open Help Center <span>→</span></button><button className="settings-logout logout-action" onClick={onLogout}><LogOut size={16} />Log out</button></section></div>
    </div>
  </>
}

function HelpPage({ setPage }) {
  return <><div className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />HERE TO HELP</div><h1>How can we <em>help?</em></h1><p className="page-subtitle">A few quick answers to help you get back to the good stuff.</p></div><button className="subtle-button" onClick={() => setPage('Settings')}><Settings size={15} />Settings</button></div><div className="help-layout"><section className="panel help-panel"><h2>Frequently asked</h2><details><summary>How do I create a group?</summary><p>Open Groups, choose Create a group, enter a group name, and add member names. You can add more people later with Manage members.</p></details><details><summary>How do custom expense shares work?</summary><p>When you add an expense, select Custom and enter each participant’s amount. The shares must add up exactly to the total before the expense can be saved.</p></details><details><summary>How do I change my password?</summary><p>Go to Settings, enter your current password and the new password twice, then choose Update password.</p></details><details><summary>Can my group members see changes from their own devices?</summary><p>Not yet. This prototype stores information in the current browser. Shared online accounts and syncing need a backend service.</p></details></section><aside className="panel help-tip"><div className="metric-icon lilac-icon"><CircleHelp size={18} /></div><h2>Still stuck?</h2><p>Check your group members and expense participants first. The balance page uses those saved shares to calculate totals.</p><button className="primary-button" onClick={() => setPage('Expenses')}>Go to expenses <span>→</span></button></aside></div></>
}

function GroupDialog({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [members, setMembers] = useState([{ name: '' }])
  const [error, setError] = useState('')
  function updateMember(index, key, value) { setMembers(current => current.map((member, i) => i === index ? { ...member, [key]: value } : member)) }
  function submit(event) {
    event.preventDefault()
    setError('')
    if (!name.trim()) return
    const newMembers = members.filter(member => member.name.trim())
    const names = newMembers.map(member => member.name.trim().toLowerCase())
    if (new Set(names).size !== names.length) return setError('Each member name should appear only once.')
    onSave(name.trim(), newMembers.map(member => makePerson(crypto.randomUUID(), member.name.trim(), '')))
  }
  return <Dialog title="Create your group" subtitle="Add the people you actually want to split with." onClose={onClose}><form onSubmit={submit}><label className="field-label">GROUP NAME<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Weekend trip, apartment…" required /></label><div className="members-form-heading"><div className="field-label">ADD MEMBERS <span>Just enter their names. You can start with yourself.</span></div><button type="button" className="icon-button" aria-label="Add member row" onClick={() => setMembers([...members, { name: '' }])}><Plus size={16} /></button></div><div className="new-member-list">{members.map((member, index) => <div className="new-member-row" key={index}><input aria-label="Member name" placeholder="Full name" value={member.name} onChange={event => updateMember(index, 'name', event.target.value)} />{members.length > 1 && <button type="button" aria-label="Remove member" onClick={() => setMembers(members.filter((_, i) => i !== index))}><X size={15} /></button>}</div>)}</div>{error && <div className="auth-error">{error}</div>}<div className="dialog-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} />Create group</button></div></form></Dialog>
}

function MemberDialog({ group, people, onClose, onSave }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    if (group?.members.some(id => people.find(person => person.id === id)?.name.toLowerCase() === name.trim().toLowerCase())) return setError('This person is already in the group.')
    onSave(makePerson(crypto.randomUUID(), name.trim(), ''))
  }
  return <Dialog title="Add a group member" subtitle={`Add someone to ${group?.name || 'your group'}.`} onClose={onClose}><form onSubmit={submit}><label className="field-label">FULL NAME<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Member name" required /></label>{error && <div className="auth-error">{error}</div>}<div className="dialog-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} />Add member</button></div></form></Dialog>
}

function ExpenseDialog({ data, initialGroup, onClose, onSave }) {
  const [groupId, setGroupId] = useState(initialGroup !== 'all' && data.groups.some(group => group.id === initialGroup) ? initialGroup : data.groups[0]?.id || '')
  const group = data.groups.find(item => item.id === groupId)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(data.user.id)
  const [category, setCategory] = useState('Food & drink')
  const [splitType, setSplitType] = useState('equal')
  const [participants, setParticipants] = useState(group?.members || [data.user.id])
  const [custom, setCustom] = useState({})
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const members = data.groups.find(item => item.id === groupId)?.members || []
    setParticipants(members)
    setPaidBy(members.includes(data.user.id) ? data.user.id : members[0] || '')
    setCustom({})
  }, [groupId, data.groups, data.user.id])

  const totalCents = Math.round(Number(amount || 0) * 100)
  const equalShares = Object.fromEntries(participants.map((id, index) => [id, (Math.floor(totalCents / Math.max(participants.length, 1)) + (index < totalCents % Math.max(participants.length, 1) ? 1 : 0)) / 100]))
  const shares = splitType === 'equal' ? equalShares : Object.fromEntries(participants.map(id => [id, Math.round(Number(custom[id] || 0) * 100) / 100]))
  const allocated = Object.values(shares).reduce((sum, value) => sum + Math.round(value * 100), 0)
  const remaining = (totalCents - allocated) / 100

  function toggleParticipant(id) {
    setParticipants(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }
  function submit(event) {
    event.preventDefault()
    if (!title.trim() || !groupId || !participants.length || totalCents <= 0) return
    if (splitType === 'custom' && remaining !== 0) return
    onSave({ groupId, title: title.trim(), category, amount: totalCents / 100, paidBy, participants, shares, date })
  }

  return <Dialog title="Add to the shared pile" subtitle="Every detail adds up. Let’s make it clear." onClose={onClose} wide><form onSubmit={submit}>
    <div className="expense-form-grid"><label className="field-label">WHAT WAS IT?<input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Dinner at that little place" required /></label><label className="field-label">HOW MUCH?<div className="amount-input-wrap"><span>₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00" required /></div></label><label className="field-label">GROUP<select value={groupId} onChange={event => setGroupId(event.target.value)} required>{data.groups.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="field-label">PAID BY<select value={paidBy} onChange={event => setPaidBy(event.target.value)}>{(group?.members || []).map(id => <option value={id} key={id}>{personName(data.people, id)}</option>)}</select></label><label className="field-label">CATEGORY<select value={category} onChange={event => setCategory(event.target.value)}>{['Food & drink', 'Groceries', 'Transport', 'Home', 'Bills', 'Entertainment', 'Other'].map(item => <option key={item}>{item}</option>)}</select></label><label className="field-label">DATE<input type="date" value={date} onChange={event => setDate(event.target.value)} required /></label></div>
    <div className="split-heading"><div><span className="field-label">HOW SHOULD IT FEEL FAIR?</span><p>Some things are shared equally. Some are a little different.</p></div><div className="split-switch"><button type="button" className={splitType === 'equal' ? 'switch-selected' : ''} onClick={() => setSplitType('equal')}>Equally</button><button type="button" className={splitType === 'custom' ? 'switch-selected' : ''} onClick={() => setSplitType('custom')}>Custom</button></div></div>
    <div className="share-list">{(group?.members || []).map(id => { const person = data.people.find(item => item.id === id); const selected = participants.includes(id); return <div className={`share-person ${selected ? '' : 'share-person-off'}`} key={id}><label className="share-person-main"><input type="checkbox" checked={selected} onChange={() => toggleParticipant(id)} /><Avatar person={person} size="small" /><span><strong>{person?.name || 'Unknown'}</strong><small>{id === paidBy ? 'Paid for this' : 'In this group'}</small></span></label>{selected && (splitType === 'custom' ? <label className="custom-amount"><span>₹</span><input type="number" min="0" step="0.01" value={custom[id] ?? ''} onChange={event => setCustom({ ...custom, [id]: event.target.value })} placeholder="0.00" aria-label={`${person?.name} share`} /></label> : <strong className="share-value">{money(shares[id] || 0)}</strong>)}</div> })}</div>
    <div className={`allocation-note ${splitType === 'custom' && remaining === 0 ? 'allocation-complete' : ''}`}>{splitType === 'equal' ? <><span>Split evenly between {participants.length} {participants.length === 1 ? 'person' : 'people'}</span><strong>{money(Number(amount || 0))} total</strong></> : <><span>{remaining === 0 ? 'Beautifully balanced.' : remaining > 0 ? `${money(remaining)} left to share` : `${money(Math.abs(remaining))} over the total`}</span><strong>{money(allocated / 100)} of {money(totalCents / 100)}</strong></>}</div>
    <div className="dialog-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={!title.trim() || !participants.length || totalCents <= 0 || (splitType === 'custom' && remaining !== 0)}><Check size={16} />Save expense</button></div>
  </form></Dialog>
}

function Dialog({ title, subtitle, onClose, children, wide = false }) {
  useEffect(() => { const handleKey = event => event.key === 'Escape' && onClose(); window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey) }, [onClose])
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className={`dialog ${wide ? 'dialog-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="dialog-header"><div><div className="eyebrow"><span className="eyebrow-line" />A LITTLE HOUSEKEEPING</div><h2>{title}</h2><p>{subtitle}</p></div><button className="close-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>{children}</section></div>
}

